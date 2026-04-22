# Test Cases - Reminder Note App

## Test Case Documentation

This document contains manual test cases for the Reminder Note App. Each test case includes preconditions, steps, expected results, and actual results.

---

## Test Case 1: Add Note with Title Only

**Test Case ID**: TC_NOTE_001  
**Test Priority**: High  
**Test Type**: Functional  
**Feature**: Note Creation  

### Objective
Verify that a user can successfully create a note with only a title and reminder time.

### Preconditions
- User is logged in
- App is open and on the main screen
- User has notification permissions enabled

### Test Data
- **Title**: "Buy groceries"
- **Reminder Date**: Tomorrow's date
- **Reminder Time**: 2:00 PM

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the "+" (Add Note) button at the bottom right | Note editor modal opens with blank fields |
| 2 | Enter "Buy groceries" in the Title field | Text appears in the title field, character count shows "13 characters" |
| 3 | Leave the body field empty | Body field remains empty with placeholder text "Add note body..." |
| 4 | Click the "Set Reminder" button | Calendar picker appears inline below the character count |
| 5 | Click on tomorrow's date in the calendar | Date is selected and highlighted |
| 6 | Click on the hour up arrow until it shows "2" | Hour changes to 2 |
| 7 | Click on the minute up arrow until it shows "00" | Minute changes to 00 |
| 8 | Click "PM" toggle | Time shows as 2:00 PM |
| 9 | Calendar automatically closes after selection | Calendar section disappears, "Set Reminder" button now shows the selected date/time |
| 10 | Click the save button "✓" at the top right | Note is saved and editor closes |
| 11 | Verify note appears in the notes list | Note "Buy groceries" is visible with reminder time displayed |
| 12 | Verify reminder icon is shown | Clock icon (⏰) appears next to the reminder time |

### Expected Results
- Note is created successfully
- Note displays in the list with title "Buy groceries"
- Reminder time is shown as "Tomorrow, 2:00 PM" format
- Note is not marked as completed
- Character count showed "13 characters" during creation

### Actual Results
*(To be filled during testing)*

### Status
- [ ] Pass
- [ ] Fail
- [ ] Blocked
- [ ] Not Executed

### Notes/Comments
*(Add any observations, bugs found, or additional information)*

---

## Test Case 2: Add Note with Title and Body

**Test Case ID**: TC_NOTE_002  
**Test Priority**: High  
**Test Type**: Functional  
**Feature**: Note Creation  

### Objective
Verify that a user can create a note with both title and body content, and set a reminder.

### Preconditions
- User is logged in
- App is open on the main screen
- User has notification permissions enabled

### Test Data
- **Title**: "Team Meeting Notes"
- **Body**: "Discuss Q2 goals, review budget, assign action items"
- **Reminder Date**: Today
- **Reminder Time**: 5:30 PM

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the "+" button to add a new note | Note editor opens |
| 2 | Enter "Team Meeting Notes" in the Title field | Title appears with character count "18 characters" |
| 3 | Click in the body field | Body field gets focus, placeholder disappears |
| 4 | Type "Discuss Q2 goals, review budget, assign action items" | Text appears in body field |
| 5 | Click "Set Reminder" button | Calendar appears inline |
| 6 | Click on today's date | Today's date is selected |
| 7 | Set time to 5:30 PM using arrow buttons | Hour shows 5, minutes show 30, PM is selected |
| 8 | Verify calendar closes | Calendar section disappears |
| 9 | Verify "Set Reminder" button shows "Today, 5:30 PM" | Button displays the selected time |
| 10 | Click save "✓" button | Note saves and editor closes |
| 11 | Find the note in the list | "Team Meeting Notes" appears in list |
| 12 | Verify body preview is shown | Body text preview is visible below title |
| 13 | Verify reminder time displays | Shows "Today, 5:30 PM" with clock icon |

### Expected Results
- Note is created with both title and body
- Body content is visible in the note preview
- Reminder is set for today at 5:30 PM
- Character count was accurate during creation
- Note appears in the list with all details

### Actual Results
*(To be filled during testing)*

### Status
- [ ] Pass
- [ ] Fail
- [ ] Blocked
- [ ] Not Executed

### Notes/Comments
*(Add any observations)*

---

## Test Case 3: Set Reminder with 12-Hour Format

**Test Case ID**: TC_REMINDER_001  
**Test Priority**: High  
**Test Type**: Functional  
**Feature**: Reminder Setting  

### Objective
Verify that the reminder time can be set correctly using 12-hour format with AM/PM toggle.

### Preconditions
- User is logged in
- Note editor is open

### Test Data
- **Title**: "Morning Workout"
- **Reminder Date**: Tomorrow
- **Reminder Time**: 6:30 AM

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open note editor (click + button) | Editor opens |
| 2 | Enter "Morning Workout" as title | Title field shows text |
| 3 | Click "Set Reminder" button | Calendar picker appears inline |
| 4 | Select tomorrow's date from calendar | Date is highlighted |
| 5 | Click hour down arrow to decrease to "6" | Hour shows 6 |
| 6 | Click minute up arrow to set to "30" | Minutes show 30 |
| 7 | Ensure "AM" is selected (not PM) | AM is highlighted/selected |
| 8 | Observe that calendar closes | Calendar section disappears |
| 9 | Check "Set Reminder" button display | Shows "Tomorrow, 6:30 AM" |
| 10 | Click save button | Note is saved |
| 11 | Verify note in list shows correct time | Displays as "Tomorrow, 6:30 AM" |

### Expected Results
- 12-hour format is displayed correctly
- AM/PM toggle works properly
- Time is saved as 6:30 AM (not PM)
- Reminder displays correctly in note list
- Calendar uses 12-hour format throughout

### Actual Results
*(To be filled during testing)*

### Status
- [ ] Pass
- [ ] Fail
- [ ] Blocked
- [ ] Not Executed

### Notes/Comments
*(Note any issues with AM/PM toggle)*

---

## Test Case 4: Prevent Past Date Selection

**Test Case ID**: TC_REMINDER_002  
**Test Priority**: High  
**Test Type**: Functional  
**Feature**: Reminder Validation  

### Objective
Verify that the calendar prevents users from selecting past dates for reminders.

### Preconditions
- User is logged in
- Note editor is open with calendar displayed

### Test Data
- **Title**: "Test Past Date"
- **Current Date**: Today's date (known)
- **Attempted Date**: Yesterday's date

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open note editor | Editor opens |
| 2 | Enter "Test Past Date" as title | Title appears |
| 3 | Click "Set Reminder" button | Calendar appears |
| 4 | Observe current month and dates | Calendar shows current month |
| 5 | Try to click on yesterday's date | Date is disabled/greyed out and unclickable |
| 6 | Try to click on any date before today | All past dates are disabled |
| 7 | Click on today's date | Today's date is selectable and gets selected |
| 8 | Click on any future date | Future dates are selectable |
| 9 | Navigate to previous month (if available) | Previous month dates should all be disabled |
| 10 | Verify only today and future dates are clickable | Past dates remain disabled |

### Expected Results
- Past dates are visually disabled (greyed out)
- Past dates cannot be clicked
- Clicking past dates has no effect
- Today's date is selectable
- All future dates are selectable
- Calendar enforces "startDate={new Date()}" constraint

### Actual Results
*(To be filled during testing)*

### Status
- [ ] Pass
- [ ] Fail
- [ ] Blocked
- [ ] Not Executed

### Notes/Comments
*(Note if any past dates are clickable - this would be a bug)*

---

## Test Case 5: Add Note via Quick Todo Mode

**Test Case ID**: TC_NOTE_003  
**Test Priority**: Medium  
**Test Type**: Functional  
**Feature**: Quick Todo Creation  

### Objective
Verify that a user can create a note quickly using the Quick Todo mode.

### Preconditions
- User is logged in
- App is on main screen

### Test Data
- **Title**: "Call dentist"
- **Reminder Date**: Today
- **Reminder Time**: 3:00 PM

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the Quick Todo button | Quick Todo modal appears as overlay |
| 2 | Modal displays "New" as header | Header shows "New" |
| 3 | Enter "Call dentist" in the input field | Text appears in input field |
| 4 | Click the bell icon (🔔) at bottom | Date picker appears |
| 5 | Select today's date | Today is selected |
| 6 | Set time to 3:00 PM | Time shows 3:00 PM |
| 7 | Click "Done" button on calendar | Calendar closes |
| 8 | Click "Done" button at bottom right | Todo is saved and modal closes |
| 9 | Verify todo appears in list | "Call dentist" appears with type "todo" |
| 10 | Verify reminder is shown | Displays "Today, 3:00 PM" |

### Expected Results
- Quick Todo modal opens smoothly
- Note can be created with minimal clicks
- Reminder can be set from Quick Todo mode
- Todo saves correctly
- Modal closes after saving
- Todo appears in main list

### Actual Results
*(To be filled during testing)*

### Status
- [ ] Pass
- [ ] Fail
- [ ] Blocked
- [ ] Not Executed

### Notes/Comments
*(Note the number of clicks required)*

---

## Test Case 6: Character Count Display

**Test Case ID**: TC_NOTE_004  
**Test Priority**: Low  
**Test Type**: Functional  
**Feature**: Note Editor  

### Objective
Verify that character count updates in real-time as user types the title.

### Preconditions
- User is logged in
- Note editor is open

### Test Data
- **Test Input**: "Hello" (5 characters)
- **Test Input 2**: "Hello World" (11 characters)
- **Test Input 3**: "" (0 characters after deletion)

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open note editor | Editor opens with "0 characters" shown |
| 2 | Type "H" in title field | Character count shows "1 characters" |
| 3 | Type "e" (total: "He") | Character count shows "2 characters" |
| 4 | Type "llo" (total: "Hello") | Character count shows "5 characters" |
| 5 | Type " World" (total: "Hello World") | Character count shows "11 characters" |
| 6 | Delete "World" (remaining: "Hello ") | Character count shows "6 characters" (space counts) |
| 7 | Delete all text | Character count shows "0 characters" |
| 8 | Type "Test" | Character count shows "4 characters" |

### Expected Results
- Character count starts at 0
- Count updates immediately with each keystroke
- Count includes spaces
- Count decreases when characters are deleted
- Count is always accurate
- Display format is "X characters"

### Actual Results
*(To be filled during testing)*

### Status
- [ ] Pass
- [ ] Fail
- [ ] Blocked
- [ ] Not Executed

### Notes/Comments
*(Note any delays in count update)*

---

## Test Case 7: Calendar Display - Inline vs Fullscreen

**Test Case ID**: TC_UI_001  
**Test Priority**: High  
**Test Type**: UI/UX  
**Feature**: Calendar Display  

### Objective
Verify that the calendar displays inline within the editor and does NOT open as a fullscreen overlay or "new page".

### Preconditions
- User is logged in
- Note editor is open

### Test Data
- **Title**: "Calendar Display Test"

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open note editor | Editor opens fullscreen |
| 2 | Observe the editor layout | Title field, body field, meta section, and toolbar are visible |
| 3 | Click "Set Reminder" button | Calendar section appears BELOW the meta section |
| 4 | Verify editor header is still visible | Back button, delete, undo, redo, save buttons remain visible |
| 5 | Verify editor is still scrollable | Can scroll to see calendar if needed |
| 6 | Verify calendar is INSIDE editor | Calendar is part of editor content, not separate overlay |
| 7 | Verify no new "page" opened | No separate screen/modal/overlay appeared |
| 8 | Verify back button still works | Clicking back closes editor (not just calendar) |
| 9 | Select a date and time | Calendar remains inline during selection |
| 10 | After selection, calendar closes | Calendar section disappears but editor remains open |
| 11 | Click "Set Reminder" again | Calendar reappears inline in same location |

### Expected Results
- Calendar appears inline within the editor
- No fullscreen overlay is created
- No separate page opens
- Editor remains visible around calendar
- User can still see title and body while calendar is open
- Calendar is contained within editor-calendar-section div
- Animation is "fadeIn" not "slideUp" from bottom

### Actual Results
*(To be filled during testing)*

### Status
- [ ] Pass
- [ ] Fail
- [ ] Blocked
- [ ] Not Executed

### Notes/Comments
*(Critical: Any fullscreen behavior is a bug and should be reported)*

---

## Test Case 8: Save Note with Reminder

**Test Case ID**: TC_REMINDER_003  
**Test Priority**: High  
**Test Type**: Functional  
**Feature**: Note Saving  

### Objective
Verify that a note with reminder can be saved successfully and persists correctly.

### Preconditions
- User is logged in
- Note editor is open

### Test Data
- **Title**: "Doctor Appointment"
- **Body**: "Annual checkup with Dr. Smith"
- **Reminder Date**: Next week (specific date)
- **Reminder Time**: 10:00 AM

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter "Doctor Appointment" as title | Title appears |
| 2 | Enter "Annual checkup with Dr. Smith" as body | Body appears |
| 3 | Click "Set Reminder" | Calendar opens inline |
| 4 | Select date one week from today | Date is selected |
| 5 | Set time to 10:00 AM | Time shows 10:00 AM |
| 6 | Verify "Set Reminder" button shows full date/time | Button displays selected date and time |
| 7 | Click save "✓" button | Note editor closes |
| 8 | Verify note appears in list | Note is visible in main list |
| 9 | Verify title is correct | Shows "Doctor Appointment" |
| 10 | Verify body preview is shown | Shows "Annual checkup with Dr. Smith" |
| 11 | Verify reminder displays correctly | Shows selected date and "10:00 AM" |
| 12 | Refresh the page | Page reloads |
| 13 | Verify note persists after refresh | Note still appears with all data |
| 14 | Verify reminder time persists | Reminder still shows correct date/time |

### Expected Results
- Note saves without errors
- All fields (title, body, reminder) are saved
- Note appears immediately in list
- Note persists after page refresh
- Reminder data is stored in ISO format
- Display format is human-readable

### Actual Results
*(To be filled during testing)*

### Status
- [ ] Pass
- [ ] Fail
- [ ] Blocked
- [ ] Not Executed

### Notes/Comments
*(Check localStorage or database for saved data)*

---

## Test Case 9: Required Fields Validation

**Test Case ID**: TC_VALIDATION_001  
**Test Priority**: High  
**Test Type**: Functional  
**Feature**: Form Validation  

### Objective
Verify that validation prevents saving a note without required fields (title and reminder time).

### Preconditions
- User is logged in
- Note editor is open

### Test Data
- **Empty Title**: ""
- **Empty Reminder**: Not set

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open note editor | Editor opens with empty fields |
| 2 | Leave title field empty | Title field shows placeholder |
| 3 | Enter some body text | Body has content |
| 4 | Do NOT set a reminder | "Set Reminder" button shows default text |
| 5 | Click save "✓" button | Alert appears: "Please enter a note title" |
| 6 | Click OK on alert | Alert closes, editor remains open |
| 7 | Enter "Test Note" as title | Title field has text |
| 8 | Still no reminder set | Reminder not selected |
| 9 | Click save "✓" button again | Alert appears: "Please select a reminder time" |
| 10 | Click OK on alert | Alert closes, editor remains open |
| 11 | Set a reminder time | Reminder is selected |
| 12 | Click save button | Note saves successfully |

### Expected Results
- Cannot save without title (validation error shown)
- Cannot save without reminder time (validation error shown)
- Alert messages are clear and helpful
- Editor doesn't close on validation error
- All field data is preserved after validation error
- Note saves successfully once all required fields are filled

### Actual Results
*(To be filled during testing)*

### Status
- [ ] Pass
- [ ] Fail
- [ ] Blocked
- [ ] Not Executed

### Notes/Comments
*(Note the exact alert messages shown)*

---

## Test Case 10: Set Reminder Button Display

**Test Case ID**: TC_UI_002  
**Test Priority**: Medium  
**Test Type**: UI/UX  
**Feature**: Reminder Button  

### Objective
Verify that "Set Reminder" button displays correctly and changes based on whether reminder is set.

### Preconditions
- User is logged in
- Note editor is open

### Test Data
- **Title**: "Button Test"
- **Reminder**: Various dates and times

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open new note editor | "Set Reminder" button shows "🕐 Set Reminder" |
| 2 | Click "Set Reminder" button | Calendar opens inline |
| 3 | Select today's date at 2:00 PM | Date and time are selected |
| 4 | Calendar closes | Button now shows "🕐 Today, 2:00 PM" (or similar format) |
| 5 | Observe button text changed | Text reflects the selected date/time |
| 6 | Click button again | Calendar reopens with previously selected time |
| 7 | Change time to 5:00 PM | Time updates |
| 8 | Calendar closes | Button shows "🕐 Today, 5:00 PM" |
| 9 | Select tomorrow's date | Date changes |
| 10 | Observe button text | Button shows tomorrow's date with time |
| 11 | Verify clock icon (🕐) is present | Icon appears before text |
| 12 | Verify button styling | Gradient purple background, white text |

### Expected Results
- Button shows "🕐 Set Reminder" when no reminder is set
- Button shows formatted date/time once reminder is selected
- Clock icon (🕐) is always present
- Button text updates immediately when reminder changes
- Button is positioned beside character count
- Button has gradient purple background
- Button has hover effect (slight lift and shadow)

### Actual Results
*(To be filled during testing)*

### Status
- [ ] Pass
- [ ] Fail
- [ ] Blocked
- [ ] Not Executed

### Notes/Comments
*(Note the exact date/time format displayed)*

---

## Summary Dashboard

### Test Execution Summary

| Category | Total Tests | Pass | Fail | Blocked | Not Executed |
|----------|-------------|------|------|---------|--------------|
| Note Creation | 5 | - | - | - | - |
| Reminder Setting | 3 | - | - | - | - |
| UI/UX | 2 | - | - | - | - |
| **Total** | **10** | **-** | **-** | **-** | **-** |

### Priority Breakdown

| Priority | Count |
|----------|-------|
| High | 8 |
| Medium | 2 |
| Low | 0 |

---

## Testing Environment

**Application**: Reminder Note App  
**Version**: 2.0  
**Platform**: Web (Desktop & Mobile)  
**Browser**: Chrome/Firefox/Safari  
**Test Date**: _________________  
**Tester Name**: _________________  
**Build Number**: _________________  

---

## Defect Tracking

If any test fails, log the defect here:

### Defect Template

**Defect ID**: DEF_001  
**Test Case ID**: TC_NOTE_001  
**Severity**: High/Medium/Low  
**Priority**: High/Medium/Low  
**Status**: Open/In Progress/Fixed/Closed  

**Description**:  
*(Describe what went wrong)*

**Steps to Reproduce**:  
1. Step 1
2. Step 2
3. Step 3

**Expected Result**:  
*(What should happen)*

**Actual Result**:  
*(What actually happened)*

**Screenshots**:  
*(Attach if available)*

**Environment**:  
- Browser: 
- OS: 
- Device: 

---

## Notes

- All test cases should be executed in order
- Mark status after each test execution
- Take screenshots for failed tests
- Note any unexpected behavior in comments section
- Retest failed cases after bug fixes
- Verify on multiple browsers (Chrome, Firefox, Safari)
- Test on both desktop and mobile viewports

---

**Document Version**: 1.0  
**Last Updated**: April 17, 2026  
**Created By**: QA Team  
**Approved By**: _________________
