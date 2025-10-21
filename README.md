# Automating Snugfit Mouthguards Order Capture & Management System

Snugfit Mouth Guards, located in a dental practice in Sandton, Johannesburg, produces
custom-fitted and personalisable mouthguards for athletes competing in contact sports.

## Problem Statement

The current order
capturing process entails a combination of paper-based and web-based forms that are
completed and submitted by customers and then captured manually onto an Excel
spreadsheet by reception staff. This process is time-consuming and repetitive, and enables
human error in the data-capturing process, potentially resulting in increased returns and
customer complaints. It is also notable that Snugfit’s website is also outdated and
requires modernisation.

## Solution Deliverables

- **Website:** Full html and CSS website redesign, accommodating the new booking form.
- **Responsive html  Booking Form:** An online, web-based html form, on `Bookings.html`, that adjusts field entries based on product selection.
- **Automated Order Capture System:** Form submission triggers a Google WebApp to fetch form responses, automatically populating a Google spreadsheet and assigning a unique impression ID.
- **SQLite Database:** A back-up SQLite database receives order data from populated Google Sheet row entries upon manual request from `db_create.py`, storing in `snugfit_orders.db`.
- **Google Website Order Dashboard:**

This will eliminate time inefficiencies and improve order accuracy. As a backup, submitted
forms will also be emailed to the reception desk in the case of a system error or breakdown.
These orders may then be manually added to the same spreadsheet. To improve brand
imaging and marketability, it is further recommended that their website is not only updated to
accommodate this new system but also to be technically and aesthetically improved.
