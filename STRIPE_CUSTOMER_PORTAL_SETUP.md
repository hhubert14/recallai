# Stripe Customer Portal Configuration

## Manual Setup Required

You need to configure the Stripe Customer Portal in your Stripe Dashboard to enable subscription management.

### Steps:

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/test/settings/billing/portal

2. **Enable Customer Portal**
   - Click "Activate test link" or "Activate" if not already enabled

3. **Configure Portal Settings**
   - **Business information**: Add your business name and logo
   - **Customer information**: Allow customers to update email and address
   - **Payment methods**: Allow customers to update payment methods
   - **Subscriptions**: 
     - ✅ Allow customers to cancel subscriptions
     - ✅ Allow customers to update subscriptions
     - ✅ Set cancellation behavior to "Cancel at period end" (recommended)
   - **Invoices**: Allow customers to view invoice history

4. **Set Default Return URL**
   - Set to: `${process.env.NEXT_PUBLIC_URL}/dashboard/settings`
   - For development: `http://localhost:3000/dashboard/settings`
   - For production: `https://yourdomain.com/dashboard/settings`

### Portal Features Enabled:

✅ **Subscription Cancellation**
- Users can cancel their subscription
- Default: Cancel at period end (user keeps access until billing period ends)
- Optional: Cancel immediately

✅ **Payment Method Management**
- Users can update credit cards
- Add/remove payment methods

✅ **Billing History**
- View past invoices
- Download receipts

✅ **Subscription Updates**
- Upgrade/downgrade plans (if you add multiple plans later)

### Testing:

1. Create a test subscription using card `4242 4242 4242 4242`
2. Go to Settings page → Click "Manage Billing"
3. Verify you can:
   - Cancel subscription
   - Update payment method
   - View billing history

### Production Deployment:

1. Repeat the configuration in your live Stripe account
2. Update return URL to your production domain
3. Test with real payment methods

---

**Note**: The Customer Portal automatically handles all subscription management, so you don't need to build custom cancellation flows. Users will be redirected to a Stripe-hosted page that handles everything securely.
