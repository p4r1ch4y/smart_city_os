# CONTEXT FOR AI ASSISTANT (DO NOT DELETE)

I am building a feature for Smart City OS (production-ready, modular urban management platform: https://smartcityos.vercel.app/). The stack is **React (frontend)** and **Node.js/Express (backend)**, with WebSockets, PostgreSQL, and modern modular code (see the public repo and deployment for UI/structure reference).

## Feature To Add: Emergency Services with Escrow-Style Payments

**Goal:**  
- Add a citizen-facing Emergency Service (“Book Service”) feature to the dashboard.
- Services include ambulance, fire, etc.—admin can manage options and fees.

**User Flow:**  
1. Citizen logs in.
2. Navigates to ‘Book Service’ page.
3. Selects service type from dropdown, enters details (e.g., location, urgency).
4. Sees dynamically calculated fee (can be flat/variable/customizable).
5. Proceeds to payment (using Dodo Payments API, in TEST/SANDBOX MODE).
6. Upon payment, sees confirmation, gets receipt, and can view payment history/details.
7. Backend/admin can review all payments and service requests with user/service/payment linkage.

**Technical Constraints:**  
- Must integrate [Dodo Payments](https://dodopayments.com) API or SDK (Node.js flavor, see docs).
- Use **test mode** (no real payments).
- Frontend should have a React “Book Service” form and a confirmation UI.
- Backend should have REST endpoint(s) for: creating a booking request, initiating Dodo payment, handling payment webhook/status.
- Admin dashboard can be table view—list citizens, requests, status, payment details.

**AI Coding Goals:**  
1. Generate clean React components for this feature (form, receipt, dashboard/table).
2. Scaffold backend endpoints for booking and payment.
3. Add Dodo Payments integration per their test/sandbox docs.
4. Use dummy data where needed.
5. Suggest code/tests in a modular, readable style, aligning with my project’s idioms.
6. Add comments explaining integration points and stubs for further expansion.

**Resources:**  
- Smart City OS deployed app: https://smartcityos.vercel.app/
- Dodo Payments docs: https://docs.dodopayments.com/

# When suggesting code, follow modern best practices and optimize for developer clarity and maintainability.
