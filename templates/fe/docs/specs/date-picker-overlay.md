# Spec: Date Picker Overlay Modes

## Objective

Open shared date pickers next to their trigger by default while preserving an opt-in
centered modal for step-form date/time fields.

## Assumptions

- `DatePicker`, `DateRangePicker`, `DateTimePicker`, and `DateInputFloat` expose
  `overlay?: 'popover' | 'dialog'` and default to `popover`.
- `RentalAvailabilityMonthPicker` always uses a popover and does not expose an overlay prop.
- The eight active `DateInputFloat` instances in event and trade-fair step forms explicitly
  use `overlay="dialog"`.
- `MiniCalendar` and the shadcn `Calendar` primitive do not manage overlays.

## Scope

- In scope: overlay composition, accessible triggers, popover anchoring, dialog override,
  custom date-range triggers, showcase coverage, and regression tests.
- Out of scope: date parsing, validation rules, API payloads, timezone behavior, calendar
  styling, and availability-calendar display behavior.

## UX / Behaviour

- A shared picker without an overlay prop opens a popover aligned to the start of its trigger.
- A shared picker with `overlay="dialog"` opens the existing centered modal.
- Closing either overlay with Escape returns focus to its trigger.
- Applying, resetting, selecting, and disabling dates behave exactly as before.
- Rental availability month selection always opens in a popover.
- Event and trade-fair step-form date/time fields continue opening in a centered dialog.

## Architecture

- A shared `DatePickerOverlay` owns the Radix Popover/Dialog switch and accessible trigger.
- Picker content remains owned by each picker and is rendered once inside the chosen shell.
- `DateInputFloat` passes a composed trigger into `DateTimePicker` so popovers have a real
  anchor; it forwards the public overlay prop.
- `DateRangePicker` custom triggers become elements rather than callbacks that manually open
  state, allowing Radix to own `aria-expanded`, Escape, and focus restoration.

## Testing Strategy

- Component tests: default popover, dialog override, start alignment, Escape/focus return,
  prop forwarding, month-picker behavior, and step-form dialog configuration.
- Browser: component showcase in German and English, dark and light themes, keyboard
  operation, viewport collision behavior, and a clean console.
- Run the full unit/component suite, typecheck, lint, and production build.

## Boundaries

- Always preserve existing draft/apply/reset semantics and use semantic styling tokens.
- Never change the global Dialog or Popover defaults for unrelated components.
- Never add manual focus management that duplicates Radix behavior.

## Success Criteria

- Every shared picker defaults to a start-aligned popover.
- `overlay="dialog"` renders the centered modal without changing picker behavior.
- All eight active step-form `DateInputFloat` usages opt into dialog mode.
- The rental month picker has no overlay switch and opens only as a popover.
- Targeted and full verification pass without new accessibility warnings.

## Open Questions

None.
