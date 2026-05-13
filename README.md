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

---
Week 9-10 Progress: Domain Layer & Unit Tests
=============================================
 
In weeks 9-10, the entire domain layer was fully implemented, including aggregates, entities, value objects, domain services, domain events, repository interfaces, and unit tests.
 
Implemented Aggregates
----------------------
 
### EventAggregate (`src/domain/event/event.aggregate.ts`)
 
The aggregate root responsible for managing the full lifecycle of an event and its ticket categories.
 
**Methods:**
* `create(props)` — creates a new event with status Draft, raises `EventCreatedEvent`
* `publish()` — publishes the event, validates via `EventPublishingPolicyService`, raises `EventPublishedEvent`
* `cancel()` — cancels the event, disables all ticket categories, raises `EventCancelledEvent`
* `createTicketCategory(props)` — creates a new ticket category, raises `TicketCategoryCreatedEvent`
* `disableTicketCategory(categoryId)` — disables a ticket category, raises `TicketCategoryDisabledEvent`
* `getTicketCategories()` — returns a copy of the ticket category list

**Implemented business rules:** BR1, BR2, BR3, BR4, BR5, BR6, BR7, BR9, BR10, BR11, BR12
### BookingAggregate (`src/domain/booking/booking.aggregate.ts`)
 
The aggregate root responsible for managing ticket bookings, including payment and expiry.
 
**Methods:**
* `create(props)` — creates a new booking with status PendingPayment, raises `TicketReserved`
* `reconstitute(props)` — reconstructs a booking from persistence without raising domain events
* `pay(amount, now?)` — processes booking payment, raises `BookingPaid`
* `expire()` — expires the booking, raises `BookingExpired`
* `markAsRefunded()` — changes the booking status to Refunded

**Implemented business rules:** BR15, BR16, BR18, BR19, BR20, BR21, BR22, BR23
### TicketEntity (`src/domain/ticket/ticket.entity.ts`)
 
The entity representing a physical ticket issued after a booking is paid.
 
**Methods:**
* `create(props)` — creates a new ticket with status Active
* `reconstitute(props)` — reconstructs a ticket from persistence
* `checkIn(now?)` — performs ticket check-in, raises `TicketCheckedIn`
* `cancel()` — cancels the ticket
* `pullDomainEvents()` — retrieves and clears accumulated domain events

**Implemented business rules:** BR25, BR26
### RefundAggregate (`src/domain/refund/refund.aggregate.ts`)
 
The aggregate root responsible for managing the refund process for customers.
 
**Methods:**
* `create(props)` — creates a new refund request with status Requested, raises `RefundRequested`
* `reconstitute(props)` — reconstructs a refund from persistence
* `approve()` — approves the refund, raises `RefundApproved`
* `reject(rejectionReason)` — rejects the refund, raises `RefundRejected`
* `markAsPaidOut(paymentReference)` — marks the refund as paid out, raises `RefundPaidOut`

**Implemented business rules:** BR28, BR30, BR31, BR32, BR33, BR34

Implemented Entities
--------------------
 
### TicketCategory (`src/domain/event/ticket-category.entity.ts`)
 
An entity managed within the EventAggregate as part of the `categories` collection.
 
**Fields:** `id`, `eventId`, `name`, `price` (Money), `quota`, `remainingQuota`, `salesStart`, `salesEnd`, `isActive`
 
**Methods:**
* `create(props)` — creates a new ticket category with validation for price, quota, and sales period
* `disable()` — deactivates the ticket category
Implemented Value Objects
--------------------------
 
| Value Object | File | Fields | Validation |
| :--- | :--- | :--- | :--- |
| `Money` | `shared/money.vo.ts` | `amount`, `currency` | amount >= 0, currency must not be empty |
| `EventSchedule` | `event/value-objects.ts` | `start`, `end` | start must be before end |
| `EventCapacity` | `event/value-objects.ts` | `capacity` | capacity > 0 |
| `PaymentDeadline` | `booking/value-objects.ts` | `value: Date` | — |
| `TicketCode` | `ticket/value-objects.ts` | `value: string` | must not be empty |
| `BookingId` | `booking/value-objects.ts` | `value: string` | must not be empty |
| `TicketId` | `ticket/value-objects.ts` | `value: string` | must not be empty |
| `RefundId` | `refund/value-objects.ts` | `value: string` | must not be empty |
 
Implemented Domain Services
----------------------------
 
### EventPublishingPolicyService (`src/domain/event/event-publishing-policy.service.ts`)
 
A domain service that validates whether an event is eligible to be published.
 
**Validations:**
* The event must have at least one active ticket category (BR4)
* The total quota of all ticket categories must not exceed the event capacity (BR5)
### RefundEligibilityService (`src/domain/refund-eligibility.service.ts`)
 
A domain service that determines whether a booking is eligible for a refund request.
 
**Validations:**
* The booking must have status Paid (BR28)
* If the event is cancelled, the refund is immediately allowed without further checks (BR29)
* The request must be submitted before the refund deadline (BR28)
* None of the tickets from the booking may have already been checked in (BR28)
### TicketCheckInPolicyService (`src/domain/ticket-check-in-policy.service.ts`)
 
A domain service that determines whether a ticket may be checked in by a gate officer.
 
**Validations:**
* The event must not have status Cancelled (US14)
* The ticket must belong to the same event as the targetEventId (BR25, US14)
* The ticket must not already have status CheckedIn (BR26, US14)
* The ticket must have status Active (BR25)
* The check-in time must fall within the allowed window on the event day (BR25)
Implemented Domain Events
--------------------------
 
All domain events implement the `DomainEvent` interface with fields `eventName` and `occurredAt`.
 
| Domain Event | File | Raised By | Triggered When |
| :--- | :--- | :--- | :--- |
| `EventCreatedEvent` | `event/event-created.event.ts` | `EventAggregate.create()` | A new event is successfully created |
| `EventPublishedEvent` | `event/event-published.event.ts` | `EventAggregate.publish()` | An event is successfully published |
| `EventCancelledEvent` | `event/event-cancelled.event.ts` | `EventAggregate.cancel()` | An event is successfully cancelled |
| `TicketCategoryCreatedEvent` | `event/ticket-category-created.event.ts` | `EventAggregate.createTicketCategory()` | A new ticket category is created |
| `TicketCategoryDisabledEvent` | `event/ticket-category-disabled.event.ts` | `EventAggregate.disableTicketCategory()` | A ticket category is disabled |
| `TicketReserved` | `booking/events.ts` | `BookingAggregate.create()` | A new booking is successfully created |
| `BookingPaid` | `booking/events.ts` | `BookingAggregate.pay()` | A booking is successfully paid |
| `BookingExpired` | `booking/events.ts` | `BookingAggregate.expire()` | A booking expires due to a missed payment deadline |
| `TicketCheckedIn` | `ticket/events.ts` | `TicketEntity.checkIn()` | A ticket is successfully checked in |
| `RefundRequested` | `refund/events.ts` | `RefundAggregate.create()` | A new refund is requested |
| `RefundApproved` | `refund/events.ts` | `RefundAggregate.approve()` | A refund is approved |
| `RefundRejected` | `refund/events.ts` | `RefundAggregate.reject()` | A refund is rejected |
| `RefundPaidOut` | `refund/events.ts` | `RefundAggregate.markAsPaidOut()` | A refund has been paid out |
 
Implemented Repository Interfaces
-----------------------------------
 
Repository interfaces are defined in the domain layer and implemented in the infrastructure layer using Prisma.
 
### IEventRepository (`src/domain/event/event.repository.ts`)
 
```typescript
findById(id: string): Promise<EventAggregate | null>
findPublished(): Promise<EventAggregate[]>
save(event: EventAggregate): Promise<void>
```
 
### IBookingRepository (`src/domain/booking/booking.repository.ts`)
 
```typescript
save(booking: BookingAggregate): Promise<void>
findById(id: string): Promise<BookingAggregate | null>
findByCustomerAndEvent(customerId: string, eventId: string): Promise<BookingAggregate[]>
findByStatus(status: BookingStatus): Promise<BookingAggregate[]>
findByEventId(eventId: string): Promise<BookingAggregate[]>
delete(id: string): Promise<void>
```
 
### ITicketRepository (`src/domain/ticket/ticket.repository.ts`)
 
```typescript
save(ticket: TicketEntity): Promise<void>
saveMany(tickets: TicketEntity[]): Promise<void>
findById(id: string): Promise<TicketEntity | null>
findByCode(code: TicketCode): Promise<TicketEntity | null>
findByBookingId(bookingId: string): Promise<TicketEntity[]>
findByStatus(status: TicketStatus): Promise<TicketEntity[]>
```
 
### IRefundRepository (`src/domain/refund/refund.repository.ts`)
 
```typescript
save(refund: RefundAggregate): Promise<void>
findById(id: string): Promise<RefundAggregate | null>
findByBookingId(bookingId: string): Promise<RefundAggregate | null>
findByStatus(status: RefundStatus): Promise<RefundAggregate[]>
findByCustomerId(customerId: string): Promise<RefundAggregate[]>
```
 
Unit Test Results
-----------------
 
All unit tests are located in `src/domain/domain.spec.ts`. Run them with `npx jest`.
 
| # | Test Case | Business Rule | Result |
| :--- | :--- | :--- | :--- |
| 1 | Booking cannot be created with zero quantity | BR16 | PASS |
| 2 | Booking cannot be created with negative quantity | BR16 | PASS |
| 3 | Booking should succeed when quantity is positive | BR16 | PASS |
| 4 | Booking cannot be paid after payment deadline | BR20 | PASS |
| 5 | Error message mentions "payment deadline has passed" | BR20 | PASS |
| 6 | Booking cannot be paid with amount less than total price | BR19 | PASS |
| 7 | Booking cannot be paid with amount more than total price | BR19 | PASS |
| 8 | Booking should succeed when payment amount equals total price | BR19 | PASS |
| 9 | Paid booking cannot be marked as expired | BR21 | PASS |
| 10 | Error message mentions "paid booking cannot be marked as expired" | BR21 | PASS |
| 11 | PendingPayment booking can be expired successfully | BR21 | PASS |
| 12 | Checked-in ticket cannot be checked in again | BR26 | PASS |
| 13 | Error message mentions "already been used" | BR26 | PASS |
| 14 | Active ticket can be checked in successfully | BR26 | PASS |
| 15 | Refund cannot be requested if any ticket is already checked in | BR28 | PASS |
| 16 | Error message mentions "checked in" | BR28 | PASS |
| 17 | Refund succeeds when all tickets are Active and booking is Paid | BR28 | PASS |
| 18 | Refund cannot be approved if status is Approved | BR30 | PASS |
| 19 | Refund cannot be approved if status is Rejected | BR30 | PASS |
| 20 | Refund cannot be approved if status is PaidOut | BR30 | PASS |
| 21 | Refund can be approved when status is Requested | BR30 | PASS |
| 22 | Rejected refund must have a rejection reason (empty string) | BR31 | PASS |
| 23 | Rejected refund must have a rejection reason (whitespace only) | BR31 | PASS |
| 24 | Refund cannot be rejected if status is not Requested | BR30 | PASS |
| 25 | Refund can be rejected with a valid reason | BR31 | PASS |
 
List of Implemented User Stories
----------------------------------
 
| # | User Story | Domain Layer Status |
| :--- | :--- | :--- |
| US1 | Create Event | ✅ EventAggregate.create() |
| US2 | Publish Event | ✅ EventAggregate.publish() |
| US3 | Cancel Event | ✅ EventAggregate.cancel() |
| US4 | Create Ticket Category | ✅ EventAggregate.createTicketCategory() |
| US5 | Disable Ticket Category | ✅ EventAggregate.disableTicketCategory() |
| US6 | View Available Events | ✅ IEventRepository.findPublished() |
| US7 | View Event Details | ✅ IEventRepository.findById() |
| US8 | Create Ticket Booking | ✅ BookingAggregate.create() |
| US9 | Calculate Booking Total Price | ✅ Money.multiply() in BookingAggregate.create() |
| US10 | Pay Booking | ✅ BookingAggregate.pay() |
| US11 | Expire Booking | ✅ BookingAggregate.expire() |
| US12 | View Purchased Tickets | ✅ ITicketRepository.findByBookingId() |
| US13 | Check In Ticket | ✅ TicketEntity.checkIn() + TicketCheckInPolicyService |
| US14 | Reject Invalid Ticket Check-in | ✅ TicketCheckInPolicyService (specific error messages) |
| US15 | Request Refund | ✅ RefundAggregate.create() + RefundEligibilityService |
| US16 | Approve Refund | ✅ RefundAggregate.approve() |
| US17 | Reject Refund | ✅ RefundAggregate.reject() |
| US18 | Mark Refund as Paid Out | ✅ RefundAggregate.markAsPaidOut() |
| US19 | View Event Sales Report | 🔧 IBookingRepository.findByEventId() (query handler pending) |
| US20 | View Event Participants | 🔧 IBookingRepository.findByEventId() (query handler pending) |
 
