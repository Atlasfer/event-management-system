Event Management System
=======================

Clean Architecture & Domain-Driven Design
* Week 8 Progress

Prerequisites
-------------

* Node.js (V17+)
* PostgreSQL
* npm / yarn / pnpm
* Docker & Docker Compose (Optional for database services)

Project Structure
-----------------

### Root

```text
event-management-system/                    
├── .env
├── .gitignore
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── README.md
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── src/
    ├── domain/
    ├── application/
    ├── infrastructure/
    ├── presentation/
    ├── main.ts
    └── app.module.ts
```

### Domain

```text
src/domain/
├── shared/
│   ├── domain-event.ts
│   ├── errors.ts
│   └── base-aggregate-root.ts
├── event/
│   ├── event.aggregate.ts
│   ├── ticket-category.entity.ts
│   ├── value-objects.ts
│   ├── events.ts
│   └── event.repository.ts
├── booking/
│   ├── booking.aggregate.ts
│   ├── value-objects.ts
│   ├── events.ts
│   └── booking.repository.ts
├── ticket/
│   ├── ticket.entity.ts
│   ├── value-objects.ts
│   ├── events.ts
│   └── ticket.repository.ts
└── refund/
    ├── refund.aggregate.ts
    ├── value-objects.ts
    ├── events.ts
    └── refund.repository.ts     
```

### Application

```text
src/application/
├── errors.ts
├── ports/
│   ├── payment-gateway.port.ts
│   ├── refund-payment.port.ts
│   └── notification.port.ts
├── dto/
│   ├── event.dto.ts
│   ├── booking.dto.ts
│   ├── ticket.dto.ts
│   └── refund.dto.ts
├── event/
│   ├── commands/
│   ├── queries/
│   ├── handlers/
│   └── query-handlers/
├── booking/
│   ├── commands/
│   ├── queries/
│   ├── handlers/
│   └── query-handlers/
├── ticket/
│   ├── commands/
│   ├── queries/
│   ├── handlers/
│   └── query-handlers/
└── refund/
    ├── commands/
    ├── queries/
    ├── handlers/
    └── query-handlers/
```

### Infrastructure

```text
src/infrastructure/
├── database/
│   ├── prisma.service.ts
│   ├── mappers/
│   └── repositories/
│       ├── prisma-event.repository.ts
│       ├── prisma-booking.repository.ts
│       ├── prisma-ticket.repository.ts
│       └── prisma-refund.repository.ts
└── services/
    ├── payment-gateway.service.ts
    ├── refund-payment.service.ts
    └── notification.service.ts   
```

### API (Presentation)

```text
src/presentation/
├── controllers/
│   ├── event.controller.ts
│   ├── booking.controller.ts
│   ├── ticket.controller.ts
│   └── refund.controller.ts
├── modules/
│   ├── event.module.ts
│   ├── booking.module.ts
│   ├── ticket.module.ts
│   └── refund.module.ts
└── request/
    ├── event.request.ts
    ├── booking.request.ts
    └── refund.request.ts
```

Business Rules
--------------

### EVENT LIFECYCLE

**Status Transitions**
Draft -> Published -> Cancelled
Published -> Completed

**Business Rules**
* BR1: A newly created event must have the status Draft.
* BR2: The event cannot be created if the end date is earlier than the start date.
* BR3: The event cannot be created if the maximum capacity is less than or equal to zero.
* BR4: An event can only be published if it has at least one active ticket category.
* BR5: An event can only be published if the total ticket quota does not exceed the maximum event capacity.
* BR6: Cancelled events cannot be published.
* BR7: Completed events cannot be cancelled.
* BR8: When an event is cancelled, paid bookings must be marked as requiring refund

### TICKET CATEGORY

* BR9: The ticket price cannot be less than zero.
* BR10: The ticket quota must be greater than zero.
* BR11: The ticket sales period must end before or at the event start date.
* BR12: The total quota of all ticket categories must not exceed the maximum event capacity.
* BR13: A ticket category that already has bookings must still be stored for historical purposes if disabled.
* BR14: Customers cannot purchase tickets from inactive ticket categories.

### BOOKING LIFECYCLE

**Status Transitions**
PendingPayment -> Paid -> Refunded
PendingPayment -> Expired

**Business Rules**
* BR15: A booking can only be created for an event with the status Published and an active ticket category within the ticket sales period.
* BR16: The ticket quantity must be greater than zero and must not exceed the remaining ticket quota.
* BR17: A customer cannot have more than one active booking for the same event.
* BR18: A booking must have a payment deadline, for example 15 minutes after it is created.
* BR19: The payment amount must be equal to the total booking price.
* BR20: A booking cannot be paid if the payment deadline has passed.
* BR21: A booking with the status Paid cannot be marked as expired.
* BR22: When a booking expires, previously reserved ticket quota is released.
* BR23: The total price is calculated from the ticket unit price multiplied by the ticket quantity, cannot be negative, and is represented using the value object Money.
* BR24: After the booking is paid, the system issues tickets with unique ticket codes.

### TICKET & CHECK-IN

**Ticket Statuses**
Active -> CheckedIn
Active -> Cancelled

**Business Rules**
* BR25: Check-in can only be performed for the event that matches the ticket, if the ticket has the status Active, and on the event day or within the allowed check-in time window.
* BR26: A ticket that has already been checked in cannot be used again.
* BR27: Tickets from cancelled events must have the status Cancelled or Refund Required.

### REFUND LIFECYCLE

**Status Transitions**
Requested -> Approved -> PaidOut
Requested -> Rejected

**Business Rules**
* BR28: A refund can only be requested for a booking with the status Paid, before the refund deadline, and cannot be requested if any ticket from the booking has already been checked in.
* BR29: If the event is cancelled, a refund is automatically allowed.
* BR30: A refund can only be approved or rejected if its status is Requested.
* BR31: A rejection reason must be provided.
* BR32: When a refund is approved, related tickets are changed to Cancelled and the related booking is changed to Refunded.
* BR33: When a refund is rejected, the related booking remains Paid and related tickets remain Active if they have not been cancelled.
* BR34: A payment reference must be recorded when a refund is marked as paid out, and a paid-out refund cannot be approved, rejected, or cancelled again.

Domain Model
------------

### AGGREGATES & ENTITIES

**Event** `[Aggregate]`
* id: `EventId`
* organizerId: `UserId`
* name: `string`
* description: `string`
* startDate: `Date`
* endDate: `Date`
* location: `string`
* maxCapacity: `int`
* status: `EventStatus`
* categories: `TicketCategory[]`

**TicketCategory** `[Entity]`
* id: `CategoryId`
* eventId: `EventId`
* name: `string`
* price: `Money`
* quota: `number`
* remainingQuota: `number`
* salesStart: `Date`
* salesEnd: `Date`
* isActive: `bool`

**Booking** `[Aggregate]`
* id: `BookingId`
* customerId: `UserId`
* eventId: `EventId`
* categoryId: `CategoryId`
* quantity: `number`
* totalPrice: `Money`
* status: `BookingStatus`
* paymentDeadline: `datetime`
* tickets: `Ticket[]`

**Ticket** `[Entity]`
* id: `TicketId`
* bookingId: `BookingId`
* code: `TicketCode`
* status: `TicketStatus`
* checkedInAt: `datetime | null`

**Refund** `[Aggregate]`
* id: `RefundId`
* bookingId: `BookingId`
* customerId: `UserId`
* amount: `Money`
* status: `RefundStatus`
* reason: `string | null`
* rejectionReason: `string | null`
* paymentReference: `string | null`
* requestedAt: `datetime`

### VALUE OBJECTS

**Money** `[Value Object]`
* amount: `Decimal`
* currency: `string`

**TicketCode** `[Value Object]`
* value: `str` (UUID/Hash)

**ID's** `[Value Object]`
* EventId
* BookingId
* RefundId

### DOMAIN EVENTS
*(All raised by aggregate methods)*
* EventCreated
* EventPublished
* EventCancelled
* TicketCategoryCreated
* TicketCategoryDisabled
* TicketReserved
* BookingPaid
* BookingExpired
* TicketCheckedIn
* RefundRequested
* RefundApproved
* RefundRejected
* RefundPaidOut

Ubiquitous Languages
--------------------

| Term | Meaning | Layer |
| :--- | :--- | :--- |
| **Event** | An activity organized by an Event Organizer and attended by customers. | Aggregate |
| **Event Organizer** | A user who creates and manages events. | Actor |
| **Customer** | A user who books and purchases tickets. | Actor |
| **Gate Officer** | A user who validates tickets during event check-in. | Actor |
| **System Admin** | A human actor who triggers refund payouts and monitors operational processes. | Actor |
| **Ticket Category** | A type of ticket, such as Regular, VIP, or Early Bird. | Entity |
| **Quota** | The maximum number of tickets available in a ticket category. | Attribute |
| **Remaining Quota** | Quota minus the number of tickets currently reserved or sold; decremented on booking, incremented on expiry. | Derived attribute |
| **Sales Period** | The period during which a ticket category can be purchased. | Value Object |
| **Booking** | A temporary reservation before payment is completed. | Aggregate |
| **Payment Deadline** | The deadline for completing payment after a booking is created. | Attribute |
| **Pending Payment** | A booking status indicating that payment has not been completed. | Status |
| **Paid** | A booking status indicating that payment has been completed. | Status |
| **Expired** | A booking status indicating that the payment deadline has passed. | Status |
| **Refunded** | Booking status indicating an approved refund has been processed; tickets are cancelled. | Status |
| **Ticket** | Proof of attendance generated after a booking is paid. | Entity |
| **Ticket Code** | A unique code used to identify and validate a ticket. | Value Object |
| **Check-in** | The process of validating a ticket when a participant enters the event venue. | Domain action |
| **Money** | A value object representing an amount and currency. | Value Object |
| **Refund** | The process of returning money to a customer. | Aggregate |
| **Refund Deadline** | The latest date/time at which a Customer may request a refund; after this, refunds are disallowed unless the event is cancelled. | Business rule |
| **Payment Gateway** | External system used to process booking payments; accessed only through the IPaymentGateway port. | Port |
| **Refund Payment Service** | External bank/payment service that disburses refund payouts to customers; accessed via IRefundPaymentService port. | Port |
| **Notification Service** | External system (email / WhatsApp) that sends transactional messages to users; accessed via INotificationService port. | Port |
| **Domain Event** | A record of something significant that happened within the domain (e.g. EventPublished, BookingPaid). Raised by aggregates; consumed by handlers. | Pattern |
| **Aggregate Root** | The entry point to a cluster of related domain objects (Event, Booking, Refund). All mutations go through the root. | Pattern |
| **Repository** | An abstraction over persistence for a single aggregate; defined as an interface in the domain layer, implemented in infrastructure. | Pattern |
| **Command** | An intent to change state (e.g. CreateEventCommand). Handled by a Command Handler in the application layer. | App layer |
| **Query** | A read-only request for data (e.g. GetAvailableEventsQuery). Handled by a Query Handler; does not change state. | App layer |
```