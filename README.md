# Automating Snugfit Mouthguards Order Capture & Management System

Snugfit Mouth Guards, located in a dental practice in Sandton, Johannesburg, produces
custom-fitted and personalisable mouthguards for athletes competing in contact sports. In addition to this, and in coordination with dental practice, they aslo produce rubberised biteplates, bleaching trays, and retainers.

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
- **Responsive HTML Booking Form:** An online, web-based html form, on `Bookings.html`, that adjusts field entries based on product selection.
- **Automated Order Capture System:** Form submission triggers a Google WebApp to fetch form responses, automatically populating a Google spreadsheet and assigning a unique impression ID.
- **Email API:** Appending a new order row in the Google sheet activates Google Apps Script's service, MailApp, to send a order confirmation email to the customer and an order copy email to Snugfit.
- **SQLite Database:** A back-up SQLite database receives order data from the populated Google Sheet row entries upon manual request from `db_create.py`, storing in `snugfit_orders.db`.
- **Data Validation for Production:** Once an order row is marked "Paid" on the Google Sheet, Google Apps Script sends the necessary data corresponding to that order to a printable Google document. This ensures production of paid orders only.
- **Order Dashboard Google Website:** A simple, integrated dashboard for Snugfit staff to view the Google sheet and document on a single user interface (UI).

## Solution Benefits

- Improves website usability, functionality, and marketability.
- Eliminates time inefficiencies associated with the manual order management system and improves order accuracy/data quality.
- Data backed-up on SQLite database and in Google Cloud.
- Improves transaction visibility for both Snugfit and their customers.
- Order dashboard website is simple to understand for staff and requires little training/effort to implement.

## Technologies Used

- **HTML5:** Snugfit website structuring and form.
- **CSS:** Snugfit website styling.
- **JavaScript:**
  - Sending `FormData` to the Google WebApp.
  - Handles the logic of receiving order data, processing it, saving it to Google Sheets and Drive, and sending confirmation emails. 
- **JSON:** Formats the incoming order data from the web form and the response sent back to the web app.
- **Python:** Automates the creation and population of an SQLite database from the Snugfit Order Capture Google Sheet.
- **SQLite:** Set up the database schema, and populate it with data.

## Order Capture & Management System Demonstration:

1) 


## Database Setup
### Using SQLite Command Line
1. Using the Powershell one-liner in the project directory
2. Run the SQL command:
<pre> Get-Content snugfit_orders.sql | sqlite3 snugfit_orders.db </pre>   




