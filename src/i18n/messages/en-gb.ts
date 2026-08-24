const enGB = {
  "common.locale": "Language",
  "common.players.count": "{0} players",
  "common.players.one": "1 player",
  "common.players.range": "{0}-{1} players",
  "common.sign_out": "Sign out",
  "common.toggle_theme": "Toggle theme",

  "enum.event_visibility.private": "Private",
  "enum.event_visibility.public": "Public",
  "enum.event_visibility.restricted": "Restricted",

  "enum.event_table_experience_level.any": "Any experience",
  "enum.event_table_experience_level.expert": "Expert",
  "enum.event_table_experience_level.first_time": "First-time friendly",
  "enum.event_table_experience_level.intermediate": "Intermediate",
  "enum.event_table_experience_level.novice": "Novice",
  "enum.event_table_experience_level.unspecified": "Unspecified",

  "enum.event_table_age_requirement.age_9_11": "Age 9-11",
  "enum.event_table_age_requirement.age_11_13": "Age 11-13",
  "enum.event_table_age_requirement.age_14_plus": "Age 14+",
  "enum.event_table_age_requirement.age_15_plus": "Age 15+",
  "enum.event_table_age_requirement.age_16_plus": "Age 16+",
  "enum.event_table_age_requirement.age_17_plus": "Age 17+",
  "enum.event_table_age_requirement.age_18_plus": "Age 18+",
  "enum.event_table_age_requirement.any": "Any age",

  "enum.event_table_language.english": "English",
  "enum.event_table_language.french": "French",
  "enum.event_table_language.german": "German",
  "enum.event_table_language.italian": "Italian",
  "enum.event_table_language.portuguese": "Portuguese",
  "enum.event_table_language.spanish": "Spanish",
  "enum.event_table_language.unspecified": "Unspecified",

  "enum.membership_payment_method.bank_transfer": "Bank transfer",
  "enum.membership_payment_method.cash": "Cash",
  "enum.membership_payment_method.twint": "TWINT",

  "error.events.create": "Unable to create event.",
  "error.events.delete": "Unable to delete event.",
  "error.events.fetch_many": "Unable to load events.",
  "error.events.fetch_one": "Unable to load event.",
  "error.events.parse_many": "Events data is invalid.",
  "error.events.parse_one": "Event data is invalid.",
  "error.events.update": "Unable to update event.",

  "error.event_tables.create": "Unable to create table.",
  "error.event_tables.delete": "Unable to delete table.",
  "error.event_tables.fetch_many": "Unable to load tables.",
  "error.event_tables.parse_many": "Tables data is invalid.",
  "error.event_tables.update": "Unable to update table.",

  "error.event_registrations.already_registered_same_table":
    "This player is already registered for this table.",
  "error.event_registrations.anonymize_old":
    "Unable to anonymize old registrations.",
  "error.event_registrations.cancel_with_token":
    "Unable to cancel this registration.",
  "error.event_registrations.create": "Unable to complete the registration.",
  "error.event_registrations.delete": "Unable to remove the registration.",
  "error.event_registrations.fetch_cancellation":
    "Unable to load this registration cancellation.",
  "error.event_registrations.fetch_many": "Unable to load registrations.",
  "error.event_registrations.invalid_cancellation_token":
    "This cancellation link is invalid or has expired.",
  "error.event_registrations.invalid_email":
    "Please enter a valid email address.",
  "error.event_registrations.invalid_guardian_contact":
    "A parent or legal guardian name and phone number are required for underage participants.",
  "error.event_registrations.parse_cancellation":
    "The registration cancellation data is invalid.",
  "error.event_registrations.parse_many": "Registrations data is invalid.",
  "error.event_registrations.registrations_closed":
    "Registrations are closed for this event.",
  "error.event_registrations.slot_conflict":
    "This player is already registered for another overlapping time slot.",
  "error.event_registrations.table_full": "This table is already full.",
  "error.event_registrations.time_slot_closed":
    "This time slot is no longer open for registration.",

  "error.event_time_slots.create": "Unable to create time slot.",
  "error.event_time_slots.delete": "Unable to delete time slot.",
  "error.event_time_slots.fetch_many": "Unable to load time slots.",
  "error.event_time_slots.parse_many": "Time slots data is invalid.",
  "error.event_time_slots.update": "Unable to update time slot.",

  "error.game_systems.create": "Unable to create game system.",
  "error.game_systems.delete":
    "Unable to delete game system, maybe some tables are using it.",
  "error.game_systems.fetch_many": "Unable to load game systems.",
  "error.game_systems.fetch_one": "Unable to load game system.",
  "error.game_systems.parse_many": "Game systems data is invalid.",
  "error.game_systems.parse_one": "Game system data is invalid.",
  "error.game_systems.update": "Unable to update game system.",

  "error.memberships.create": "Unable to complete the membership registration.",
  "error.memberships.delete": "Unable to delete the membership.",
  "error.memberships.email_already_used":
    "This email has already been used for a membership.",
  "error.memberships.fetch_many": "Unable to load memberships.",
  "error.memberships.invalid_email": "Please enter a valid email address.",
  "error.memberships.invalid_home_address":
    "Please enter a complete home address.",
  "error.memberships.invalid_name": "Please enter your first and last name.",
  "error.memberships.invalid_payment_method": "Please choose a payment method.",
  "error.memberships.parse_many": "Memberships data is invalid.",
  "error.memberships.update": "Unable to update the membership.",

  "form.event_details.description.label": "Description",
  "form.event_details.heading": "Details",
  "form.event_details.image_url.label": "Image URL",
  "form.event_details.location_address.label": "Address",
  "form.event_details.location_name.label": "Location",
  "form.event_details.registrations_open": "Registrations open",
  "form.event_details.registrations_open_at.label": "Registration opening date",
  "form.event_details.registrations_open_at_time.label":
    "Registration opening time",
  "form.event_details.short_description.label": "Short description",
  "form.event_details.slug.label": "Slug",
  "form.event_details.starts_at_date.label": "Date",
  "form.event_details.starts_at_time.label": "Time",
  "form.event_details.title.label": "Title",
  "form.event_details.visibility.label": "Visibility",

  "form.event_table.age_requirement.label": "Age requirement",
  "form.event_table.description.label": "Description",
  "form.event_table.experience_level.label": "Experience level",
  "form.event_table.game_master_name.label": "Game master",
  "form.event_table.game_system.label": "Game system",
  "form.event_table.image_url.label": "Image URL",
  "form.event_table.language.label": "Language",
  "form.event_table.max_players.label": "Max players",
  "form.event_table.min_players.label": "Min players",
  "form.event_table.notes.label": "Notes",
  "form.event_table.time_slot.label": "Time slot",
  "form.event_table.title.label": "Title",

  "form.event_time_slot.date.label": "Date",
  "form.event_time_slot.ends_at_time.label": "End time",
  "form.event_time_slot.starts_at_time.label": "Start time",

  "form.game_system.background_image_url.label": "Background image URL",
  "form.game_system.cover_image_url.label": "Cover image URL",
  "form.game_system.description.label": "Description",
  "form.game_system.heading": "Details",
  "form.game_system.logo_image_url.label": "Logo image URL",
  "form.game_system.name.label": "Name",

  "form.home_message.body_en.label": "Message in English",
  "form.home_message.body_it.label": "Message in Italian",
  "form.home_message.enabled": "Show when there are no upcoming events",
  "form.home_message.heading": "No upcoming events message",
  "form.home_message.title_en.label": "Title in English",
  "form.home_message.title_it.label": "Title in Italian",

  "layout.public_footer.copyright": "Gamers Guild Ticino",
  "layout.public_footer.data_and_terms": "Data & Terms",
  "layout.public_footer.donations": "Donations",
  "layout.public_footer.instagram": "Instagram",
  "layout.public_footer.whatsapp": "WhatsApp",

  "locale.en-GB": "English",
  "locale.it-CH": "Italiano",

  "page.admin.create_event.description": "Prepare a new event.",
  "page.admin.create_event.heading": "Create event",
  "page.admin.create_event.open": "New event",
  "page.admin.description": "Manage events and registrations for GGT.",
  "page.admin.events.description": "View and manage existing events.",
  "page.admin.events.heading": "Events",
  "page.admin.events.open": "Open events",
  "page.admin.game_systems.description":
    "Manage reusable game systems for event tables.",
  "page.admin.game_systems.heading": "Game systems",
  "page.admin.game_systems.open": "Open game systems",
  "page.admin.heading": "Dashboard",
  "page.admin.home_message.description":
    "Edit the localized message shown on the home page when no events are scheduled.",
  "page.admin.home_message.heading": "Home message",
  "page.admin.home_message.open": "Edit message",
  "page.admin.memberships.description":
    "View, add, edit, and remove association members.",
  "page.admin.memberships.heading": "Memberships",
  "page.admin.memberships.open": "Open memberships",

  "page.admin_event.back_to_events": "Back to events",
  "page.admin_event.breadcrumb.admin": "Dashboard",
  "page.admin_event.breadcrumb.event": "Manage event",
  "page.admin_event.breadcrumb.events": "Events",
  "page.admin_event.error.generic": "Something went wrong, please try again.",
  "page.admin_event.error.missing_event": "Missing event id.",
  "page.admin_event.event_over": "Event over",
  "page.admin_event.event_over_notice":
    "All time slots are in the past. Public registrations are no longer available.",
  "page.admin_event.heading": "Manage event",
  "page.admin_event.preview": "Preview",
  "page.admin_event.registrations_open_at_notice":
    "Registrations are currently closed. Opening date shown to users: {0}.",
  "page.admin_event.save": "Save changes",
  "page.admin_event.saved": "Event saved.",
  "page.admin_event.tables.cancel": "Cancel",
  "page.admin_event.tables.create": "Add table",
  "page.admin_event.tables.delete": "Delete",
  "page.admin_event.tables.delete.confirm":
    'Delete "{0}"? This cannot be undone.',
  "page.admin_event.tables.edit": "Edit",
  "page.admin_event.tables.error.generic":
    "Something went wrong, please try again.",
  "page.admin_event.tables.error.missing_user":
    "You must be logged in to create a table.",
  "page.admin_event.tables.game_master": "Game Master: {0}",
  "page.admin_event.tables.hide_description": "Hide details",
  "page.admin_event.tables.new": "New table",
  "page.admin_event.tables.no_game_systems":
    "Create a game system before adding tables.",
  "page.admin_event.tables.no_time_slots":
    "Create a time slot before adding tables.",
  "page.admin_event.tables.notes": "Notes",
  "page.admin_event.tables.registrations.add": "Add",
  "page.admin_event.tables.registrations.added": "Player added.",
  "page.admin_event.tables.registrations.anonymized": "Anonymized",
  "page.admin_event.tables.registrations.confirm_add": "Confirm add",
  "page.admin_event.tables.registrations.delete": "Remove",
  "page.admin_event.tables.registrations.delete.confirm":
    'Remove "{0}" from this table?',
  "page.admin_event.tables.registrations.email": "Email",
  "page.admin_event.tables.registrations.empty": "No registered players yet.",
  "page.admin_event.tables.registrations.guardian_contact":
    "Parent/guardian: {0}, {1}",
  "page.admin_event.tables.registrations.heading": "Registrations ({0}/{1})",
  "page.admin_event.tables.registrations.hide": "Hide registrations",
  "page.admin_event.tables.registrations.phone_number": "Phone number",
  "page.admin_event.tables.registrations.player_name": "Name",
  "page.admin_event.tables.registrations.show": "Show registrations",
  "page.admin_event.tables.save": "Save changes",
  "page.admin_event.tables.show_description": "Show details",
  "page.admin_event.tables.time_slot": "Time slot: {0}",
  "page.admin_event.time_slots.cancel": "Cancel",
  "page.admin_event.time_slots.create": "Add time slot",
  "page.admin_event.time_slots.delete": "Delete",
  "page.admin_event.time_slots.delete.confirm":
    'Delete "{0}"? Tables assigned to this time slot will also be deleted.',
  "page.admin_event.time_slots.edit": "Edit",
  "page.admin_event.time_slots.empty": "No time slots yet.",
  "page.admin_event.time_slots.error.generic":
    "Something went wrong, please try again.",
  "page.admin_event.time_slots.error.missing_user":
    "You must be logged in to create a time slot.",
  "page.admin_event.time_slots.new": "New time slot",
  "page.admin_event.time_slots.save": "Save changes",

  "page.admin_events.anonymize_old": "Anonymize events",
  "page.admin_events.anonymize_old.confirm":
    "Anonymize personal data for registrations linked to events that ended more than 12 months ago?",
  "page.admin_events.anonymize_old.success":
    "{0} old registrations anonymized.",
  "page.admin_events.breadcrumb.admin": "Dashboard",
  "page.admin_events.breadcrumb.events": "Events",
  "page.admin_events.compose_email": "Compose email",
  "page.admin_events.compose_email_body":
    'Hello,\n\nThis email is about "{0}".\n\nBest regards,\nGamers Guild Ticino',
  "page.admin_events.compose_email_error": "Unable to open the email draft.",
  "page.admin_events.compose_email_subject": 'GGT - "{0}"',
  "page.admin_events.copy_emails": "Copy emails",
  "page.admin_events.copy_emails_error": "Unable to copy emails.",
  "page.admin_events.copy_emails_success": 'Emails copied for "{0}".',
  "page.admin_events.delete": "Delete",
  "page.admin_events.delete.confirm": 'Delete "{0}"? This cannot be undone.',
  "page.admin_events.empty": "No events yet.",
  "page.admin_events.error": "Unable to load events.",
  "page.admin_events.event_over": "Event over",
  "page.admin_events.heading": "Events",
  "page.admin_events.location": "Location",
  "page.admin_events.manage": "Manage",
  "page.admin_events.more": "More actions",
  "page.admin_events.new": "New event",
  "page.admin_events.registrations_closed": "Registrations closed",
  "page.admin_events.registrations_open": "Registrations open",
  "page.admin_events.starts_at": "Date",
  "page.admin_events.stats.seats": "{0}/{1} seats",
  "page.admin_events.stats.tables": "{0}/{1} tables",
  "page.admin_events.visibility": "Visibility",

  "page.admin_events_new.breadcrumb.admin": "Dashboard",
  "page.admin_events_new.breadcrumb.events": "Events",
  "page.admin_events_new.breadcrumb.new": "New event",
  "page.admin_events_new.cancel": "Cancel",
  "page.admin_events_new.create": "Create",
  "page.admin_events_new.error.generic":
    "Something went wrong, please try again.",
  "page.admin_events_new.error.missing_user":
    "You must be logged in to create a new event.",
  "page.admin_events_new.heading": "Create new event",

  "page.admin_game_system.back_to_game_systems": "Back to game systems",
  "page.admin_game_system.breadcrumb.admin": "Dashboard",
  "page.admin_game_system.breadcrumb.game_system": "Manage game system",
  "page.admin_game_system.breadcrumb.game_systems": "Game systems",
  "page.admin_game_system.error.generic":
    "Something went wrong, please try again.",
  "page.admin_game_system.error.missing_game_system": "Missing game system id.",
  "page.admin_game_system.heading": "Manage game system",
  "page.admin_game_system.save": "Save changes",
  "page.admin_game_system.saved": "Game system saved.",

  "page.admin_game_systems.breadcrumb.admin": "Dashboard",
  "page.admin_game_systems.breadcrumb.game_systems": "Game systems",
  "page.admin_game_systems.delete": "Delete",
  "page.admin_game_systems.delete.confirm":
    'Delete "{0}"? This cannot be undone.',
  "page.admin_game_systems.empty": "No game systems yet.",
  "page.admin_game_systems.error": "Unable to load game systems.",
  "page.admin_game_systems.heading": "Game systems",
  "page.admin_game_systems.manage": "Manage",
  "page.admin_game_systems.new": "New game system",

  "page.admin_game_systems_new.back_to_game_systems": "Back to game systems",
  "page.admin_game_systems_new.breadcrumb.admin": "Dashboard",
  "page.admin_game_systems_new.breadcrumb.game_systems": "Game systems",
  "page.admin_game_systems_new.breadcrumb.new": "New game system",
  "page.admin_game_systems_new.create": "Create",
  "page.admin_game_systems_new.error.generic":
    "Something went wrong, please try again.",
  "page.admin_game_systems_new.error.missing_user":
    "You must be logged in to create a new game system.",
  "page.admin_game_systems_new.heading": "Create game system",

  "page.admin_home_message.back_to_admin": "Back to dashboard",
  "page.admin_home_message.breadcrumb.admin": "Dashboard",
  "page.admin_home_message.breadcrumb.home_message": "Home message",
  "page.admin_home_message.error.generic":
    "Something went wrong, please try again.",
  "page.admin_home_message.heading": "Home message",
  "page.admin_home_message.save": "Save changes",
  "page.admin_home_message.saved": "Home message saved.",

  "page.admin_memberships.actions": "Membership actions",
  "page.admin_memberships.breadcrumb.admin": "Dashboard",
  "page.admin_memberships.breadcrumb.memberships": "Memberships",
  "page.admin_memberships.copy_csv": "Copy as CSV",
  "page.admin_memberships.copy_csv_success": "Memberships copied as CSV.",
  "page.admin_memberships.copy_emails": "Copy emails",
  "page.admin_memberships.copy_emails_success": "Membership emails copied.",
  "page.admin_memberships.copy_error": "Unable to copy memberships.",
  "page.admin_memberships.copy_newsletter_emails": "Copy newsletter emails",
  "page.admin_memberships.copy_newsletter_emails_success":
    "Newsletter membership emails copied.",
  "page.admin_memberships.created": "Membership created.",
  "page.admin_memberships.created_for": 'Membership for "{0}" created.',
  "page.admin_memberships.delete": "Delete",
  "page.admin_memberships.delete.confirm":
    'Delete the membership for "{0}"? This cannot be undone.',
  "page.admin_memberships.deleted": 'Membership for "{0}" deleted.',
  "page.admin_memberships.details.close": "Close membership details",
  "page.admin_memberships.edit": "Edit",
  "page.admin_memberships.empty": "No memberships yet.",
  "page.admin_memberships.form.cancel": "Cancel",
  "page.admin_memberships.form.city": "City",
  "page.admin_memberships.form.create": "Add membership",
  "page.admin_memberships.form.create_heading": "Add membership",
  "page.admin_memberships.form.edit_heading": "Edit membership",
  "page.admin_memberships.form.email": "Email address",
  "page.admin_memberships.form.first_name": "First name",
  "page.admin_memberships.form.last_name": "Last name",
  "page.admin_memberships.form.newsletter": "Newsletter accepted",
  "page.admin_memberships.form.payment_method": "Payment method",
  "page.admin_memberships.form.phone_number": "Phone number",
  "page.admin_memberships.form.postal_code": "Postcode",
  "page.admin_memberships.form.save": "Save changes",
  "page.admin_memberships.form.street": "Street and number",
  "page.admin_memberships.heading": "Memberships",
  "page.admin_memberships.newsletter": "Newsletter",
  "page.admin_memberships.table.actions": "Actions",
  "page.admin_memberships.table.city": "City",
  "page.admin_memberships.table.created_at": "Joined",
  "page.admin_memberships.table.email": "Email",
  "page.admin_memberships.table.first_name": "First name",
  "page.admin_memberships.table.home_address": "Home address",
  "page.admin_memberships.table.last_name": "Last name",
  "page.admin_memberships.table.newsletter": "Newsletter",
  "page.admin_memberships.table.no": "No",
  "page.admin_memberships.table.payment_method": "Payment",
  "page.admin_memberships.table.phone_number": "Phone",
  "page.admin_memberships.table.postal_code": "Postcode",
  "page.admin_memberships.table.street": "Street",
  "page.admin_memberships.table.yes": "Yes",
  "page.admin_memberships.updated": "Membership updated.",
  "page.admin_memberships.updated_for": 'Membership for "{0}" updated.',

  "page.admin_forgot_password.back_to_login": "Back to login",
  "page.admin_forgot_password.confirmation":
    "If that account exists, a reset email has been sent.",
  "page.admin_forgot_password.email.label": "Email",
  "page.admin_forgot_password.heading": "Reset password",
  "page.admin_forgot_password.send": "Send reset email",

  "page.admin_login.email.label": "Email",
  "page.admin_login.forgot_password": "Forgot password?",
  "page.admin_login.heading": "Sign in to GGT",
  "page.admin_login.password.label": "Password",
  "page.admin_login.sign_in": "Sign In",

  "page.admin_reset_password.back_to_login": "Back to login",
  "page.admin_reset_password.confirm_password.label": "Confirm password",
  "page.admin_reset_password.error.generic":
    "Unable to update the password. Please try again.",
  "page.admin_reset_password.error.invalid_link":
    "This recovery link is invalid or has expired.",
  "page.admin_reset_password.error.password_mismatch":
    "The passwords do not match.",
  "page.admin_reset_password.heading": "Choose a new password",
  "page.admin_reset_password.password.label": "New password",
  "page.admin_reset_password.submit": "Update password",
  "page.admin_reset_password.success":
    "Password updated. Redirecting to login.",

  "page.data_and_terms.content": `
##Overview##
These terms explain how Gamers Guild Ticino manages table registrations and the personal data submitted through this website.

##Participation##
By registering for a table, participants confirm that the submitted information is accurate, that they can arrive 15 minutes before the indicated time, that they can attend the selected session in full, and that they will follow the event rules and the instructions of the organizers. Discriminatory, offensive, racist, or sexist behaviour may result in removal from the event.

Participants also confirm that they meet the table requirements shown on the website, including age requirement, experience level, and table language.

For age 14+, 15+, 16+, and 17+ tables, underage participants must provide the name and phone number of a parent or legal guardian.

For age 9-11 and age 11-13 tables, the registration must be submitted by a parent or legal guardian who will be present and responsible for the child during the activity.

##Data we collect##
• Full name, used to identify the participant at the table.
• Email address, used for registration confirmations and event-related communications.
• Phone number, used only for practical or urgent event-related communication.
• For underage participants registered for age 14+, 15+, 16+, or 17+ tables, parent or legal guardian name and phone number, used only for event-related organizational, practical, or urgent needs.

##Why we use the data##
The data is used to manage event registrations, contact participants about the event, coordinate tables, and handle operational changes such as cancellations or schedule updates. We do not use registration data for newsletters or marketing campaigns without separate consent.

##Storage and access##
Registration data is stored through Supabase, the external technical provider we use for the website database, authentication, and backend services. Access is limited to authorized organizers.
Transactional emails, such as registration confirmations and removal confirmations, are sent through Mailjet. Mailjet may process recipient email addresses for delivery, technical tracking, bounce handling, abuse prevention, and deliverability.

##Retention##
Registration data may be kept after the event for internal organization and event history. Registrations linked to events that ended more than 12 months ago may be anonymized, removing name, email, and phone number while preserving aggregate participation counts.

##Participant rights##
Participants may ask to access or correct their registration data.
Participants may ask us to remove their registration from an event. Removing a registration deletes the table booking and frees the seat.
For events that have already ended, participants may ask us to anonymize their personal data linked to that event. Anonymization removes name, email, and phone number while preserving aggregate participation counts.
Some data may need to be kept temporarily when required for event organization or legal reasons.

##Contact##
For questions, access requests, corrections, registration removal requests, or anonymization requests, contact us at @@{0}@@.
`,
  "page.data_and_terms.heading": "Data Transparency and Participation Terms",
  "page.data_and_terms.last_updated": "Last updated: June 2026",
  "page.data_and_terms.url": "/data-and-terms",

  "page.event.back_to_home": "Back to home",
  "page.event.details.address": "Address",
  "page.event.details.date": "Date",
  "page.event.details.location": "Location",
  "page.event.details.time": "Time",
  "page.event.error.missing": "Missing event id.",
  "page.event.event_over": "Event over",
  "page.event.hero.event_over":
    "This event has already ended. You can still browse the tables that were part of it.",
  "page.event.hero.registration_closed":
    "Registrations are not open right now. You can still browse the available tables.",
  "page.event.hero.registration_open":
    "Browse the available tables and choose the adventure you want to join.",
  "page.event.hero.registration_scheduled":
    "Registrations will open *{0}*. You can still browse the available tables.",
  "page.event.map.heading": "How to get there",
  "page.event.map.jump_to_map": "Get here",
  "page.event.map.open_in_google_maps": "Open in Google Maps",
  "page.event.registration.accept_terms": "I accept the ",
  "page.event.registration.accept_time":
    "I confirm that I can arrive 15 minutes before the indicated time and attend the session in full",
  "page.event.registration.cancel": "Cancel",
  "page.event.registration.email": "Email",
  "page.event.registration.guardian_confirmation":
    "As a parent or legal guardian, I confirm that I will be present and responsible for the child during the activity.",
  "page.event.registration.guardian_name": "Parent/guardian name",
  "page.event.registration.guardian_phone_number":
    "Parent/guardian phone number",
  "page.event.registration.name": "Name",
  "page.event.registration.open": "Register",
  "page.event.registration.participant_is_minor": "I am under 18",
  "page.event.registration.phone_number": "Phone number",
  "page.event.registration.submit": "Register",
  "page.event.registration.success":
    "Registration completed. A confirmation email has been sent.",
  "page.event.registration.terms_link":
    "terms of participation and on data usage",
  "page.event.registrations_open": "Registrations open",
  "page.event.registrations_open_at": "Registrations open on {0}",
  "page.event.tables.available_seats/*": "{0} seats left",
  "page.event.tables.available_seats/1": "{0} seat left",
  "page.event.tables.choose": "Register",
  "page.event.tables.close": "Close",
  "page.event.tables.closed": "Closed",
  "page.event.tables.empty": "No tables yet.",
  "page.event.tables.game_master": "Game Master: {0}",
  "page.event.tables.heading": "Tables",
  "page.event.tables.hide_details": "Hide details",
  "page.event.tables.jump_tables": "Join a table",
  "page.event.tables.no_game_system": "Without Game System",
  "page.event.tables.notes": "Notes",
  "page.event.tables.seats": "Seats",
  "page.event.tables.show_details": "Show details",

  "page.home.about.card_1.description":
    "One-shot adventures and short campaigns, with tables for different tastes and experience levels.",
  "page.home.about.card_1.title": "Monthly events",
  "page.home.about.card_2.description":
    "Choose a table, meet the game master, and play with a small group in person.",
  "page.home.about.card_2.title": "Live tables",
  "page.home.about.card_3.description":
    "New players, curious visitors, and experienced adventurers are all welcome.",
  "page.home.about.card_3.title": "Open community",
  "page.home.about.description":
    "Gamers Guild Ticino brings people together around shared stories, dice, and live tabletop role-playing games.",
  "page.home.about.heading": "Play stories together",
  "page.home.event.url": "/events/{0}",
  "page.home.events.contact_cta": "Contact us",
  "page.home.events.contact_text":
    "Questions, proposals, or do you want to join the association?",
  "page.home.events.contacts_follow": "Follow us",
  "page.home.events.contacts_join": "Join the association",
  "page.home.events.contacts_join_cta": "Open membership form",
  "page.home.events.contacts_join_description":
    "Fill in the form to become a member of Gamers Guild Ticino.",
  "page.home.events.description":
    "Pick an event, browse the available tables, and reserve your seat when registrations are open.",
  "page.home.events.empty": "No upcoming events.",
  "page.home.events.heading": "Upcoming events",
  "page.home.events.info_eyebrow": "How it works",
  "page.home.events.info_intro":
    "Gamers Guild Ticino is a non-profit association that promotes the culture and diffusion of role-playing games, encouraging socialization, community building, and sharing a passion for play through events and open initiatives.",
  "page.home.events.info_step_1": "Each event may host one or more tables.",
  "page.home.events.info_step_2":
    "Open an event to see tables, game masters, and requirements.",
  "page.home.events.info_step_3":
    "When registrations are open, reserve your seat online.",
  "page.home.events.open": "View event",
  "page.home.events.open_and_register": "View event / Register",
  "page.home.events.registrations_closed": "Registrations closed",
  "page.home.events.registrations_open": "Registrations open",
  "page.home.events.registrations_open_at": "Registrations open on {0}",
  "page.home.heading": "Gamers Guild Ticino",
  "page.home.hero.about": "About the association",
  "page.home.hero.card.description":
    "Every event hosts multiple tables, each with its own game, tone, and game master.",
  "page.home.hero.card.heading": "Find your next table",
  "page.home.hero.card.label": "Live tabletop role-playing",
  "page.home.hero.description":
    "Monthly live TTRPG events in Ticino for players, game masters, and anyone curious about role-playing games.",
  "page.home.hero.events": "See upcoming events",
  "page.home.hero.eyebrow": "TTRPG events in Ticino",

  "page.donation.description":
    "Support Gamers Guild Ticino activities with a free donation.",
  "page.donation.heading": "Donations",
  "page.donation.info":
    "Gamers Guild Ticino is a non-profit association. Donations help us organize events, buy games and materials, take part in fairs, and grow the project.\n\nYou can donate any amount you like. These are a few suggested values:",
  "page.donation.url": "/donations",

  "page.membership.card_info":
    "Membership does not expire. You can renew your support whenever you want, with no limits or deadlines.\n\nAfter completing the registration, you can collect your physical membership card at any Gamers Guild Ticino event. The confirmation email is valid as a temporary membership card.\n\nThe card includes a level bar to track of how many activities you have joined with us. Once filled, you will have spent roughly a year of games with the association, and you can use it as a friendly reminder to renew your support, with no obligation.",
  "page.membership.description":
    "Become a member of Gamers Guild Ticino with a free donation.",
  "page.membership.donation.chf_5.body": "Helps support the association.",
  "page.membership.donation.chf_5.title": "CHF 5",
  "page.membership.donation.chf_10.body": "Helps us cover communication costs.",
  "page.membership.donation.chf_10.title": "CHF 10",
  "page.membership.donation.chf_20.body":
    "Helps us buy new games and materials.",
  "page.membership.donation.chf_20.title": "CHF 20",
  "page.membership.donation.chf_50.body":
    "Helps us take part in fairs and develop the project further.",
  "page.membership.donation.chf_50.title": "CHF 50+",
  "page.membership.form.accept_terms": "I accept the ",
  "page.membership.form.city": "City",
  "page.membership.form.city.placeholder": "Lugano",
  "page.membership.form.email": "Email address",
  "page.membership.form.email.placeholder": "name@example.com",
  "page.membership.form.first_name": "First name",
  "page.membership.form.first_name.placeholder": "Jane",
  "page.membership.form.heading": "Your details",
  "page.membership.form.last_name": "Last name",
  "page.membership.form.last_name.placeholder": "Doe",
  "page.membership.form.newsletter":
    "I want to receive news and updates from Gamers Guild Ticino",
  "page.membership.form.payment_method": "Payment method",
  "page.membership.form.phone_number": "Phone number",
  "page.membership.form.phone_number.placeholder": "+41 79 000 00 00",
  "page.membership.form.postal_code": "Postcode",
  "page.membership.form.postal_code.placeholder": "6900",
  "page.membership.form.street": "Street and number",
  "page.membership.form.street.placeholder": "Via Maggio 18",
  "page.membership.form.submit": "Join the association",
  "page.membership.form.terms_link": "association terms and data conditions",
  "page.membership.heading": "Join Gamers Guild Ticino",
  "page.membership.info":
    "With this form you confirm your membership in Gamers Guild Ticino. Thank you for your support!\n\nThe membership contribution is a free donation. These are the suggested amounts:",
  "page.membership.payment.bank_transfer.body":
    "Gamers Guild Ticino\nVia Maggio 18, 6900 Lugano\nCH13 0900 0000 1687 2277 9\nPayment reason: tesseramento GG",
  "page.membership.payment.bank_transfer.title": "Bank transfer",
  "page.membership.payment.cash.body":
    "You can pay at any Gamers Guild Ticino event.",
  "page.membership.payment.cash.title": "Cash",
  "page.membership.payment.heading": "Payment details",
  "page.membership.payment.twint.body":
    '+41 79 561 90 15\nPlease write "Donazione GG!" in the payment note.',
  "page.membership.payment.twint.title": "TWINT",
  "page.membership.success":
    "Membership registration completed. A confirmation email has been sent.",
  "page.membership.url": "/membership",

  "page.not_found.heading": "Page Not Found",
  "page.registration_cancellation.confirm": "Cancel registration",
  "page.registration_cancellation.description":
    "Review the registration details before confirming the cancellation.",
  "page.registration_cancellation.game_master": "Game Master: {0}",
  "page.registration_cancellation.heading": "Cancel registration",
  "page.registration_cancellation.success":
    "Registration cancelled. A confirmation email has been sent.",
  "page.registration_cancellation.table": "Table: {0}",
} as const;

export default enGB;
