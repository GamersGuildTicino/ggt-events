# GGT Event Management Platform

This project is intended to become a web application for a local association that organizes monthly live tabletop roleplaying events.

The current goal is to define the expected behavior of the platform before implementation details are finalized. The product direction described here reflects the current understanding of the organizers' needs and should be treated as a working specification.

## Purpose

The platform should help the association manage event publication and player registrations with a simple flow:

1. Admins prepare an event internally.
2. Admins publish the event when registrations should open.
3. Players receive a link to the public event page.
4. Players review the available tables and register for a table that still has space.

## Intended Users

### Admins

Admins are responsible for creating and managing events and tables before an event is made public.

### Players

Players are end users who access a public event page through a shared link and sign up for one of the available tables.

## Core Domain

### Event

An event represents one monthly association session and should include at least:

- A name
- A date
- A location
- A collection of tables/games
- A publication state

An event starts as a draft or otherwise non-public event. While it is not public, admins can still modify it. Once it is made public, users should be able to access it and sign up.

### Table

A table represents one game offered during an event and should include at least:

- A title
- A game system
- A minimum number of players
- A maximum number of players

Each table belongs to a single event.

### Registration

A registration represents a player's sign-up for a specific table in a specific event.

At this stage, the intended registration flow is lightweight: the player provides:

- Name
- Email address

The platform should only allow registrations on tables that are not full.

## Intended Behavior

### Admin Workflow

Admins should be able to:

- View existing events
- Create a new event
- Edit an existing event while it is not yet public
- Define one or more tables for an event
- Publish an event to make it accessible to players

Publishing is a meaningful state change. Before publication, the event is managed internally. After publication, the event is available through a shareable link and should accept player registrations.

### Player Workflow

Players should be able to:

- Open a public event page from a direct link
- See the event details relevant to participation
- Browse the available tables for that event
- Identify which tables still have space
- Submit a registration by entering their name and email

Players should not need admin access to register.

## Rules and Constraints

The following behavior is currently intended:

- Only public events can accept player registrations.
- Only tables with remaining capacity can be joined.
- Events that are not yet public remain editable by admins.
- Event tables are part of the event definition and should be managed alongside the event.

## Expected Product Scope

The current scope is intentionally narrow and focused on the association's core operational needs:

- Event creation and management
- Table setup per event
- Public event sharing
- Simple player sign-up

This keeps the first version centered on making monthly event organization workable before expanding into secondary features.

## Open Product Questions

The detailed behavior still needs to be discussed with the event organizers. At minimum, the following decisions remain open:

- Whether events can still be edited after publication, and if so, which fields can change
- Whether admins can manually add, move, or remove player registrations
- Whether players can change or cancel their own registration
- Whether one player can register for more than one table in the same event
- Whether a waitlist is needed once a table is full
- Whether registration confirmation emails should be sent
- Whether duplicate registrations should be prevented, and by which rule
- Which event details should be visible on the public page beyond name, date, location, and tables
- What level of spam protection or validation is needed on the registration form
- Whether the platform needs authentication for admins only, or eventually for players as well

## Planned Technical Direction

The application is intended to be built with:

- Vite
- React
- Chakra UI
- Supabase

This README describes intended product behavior, not a finalized technical design.
