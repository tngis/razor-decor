import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

// Configure email transporter
// For Gmail: Enable "Less secure app access" or use App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user, // Your Gmail
    pass: functions.config().email.password, // Your App Password
  },
});

// Alternative: Using SendGrid, Mailgun, etc.
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(functions.config().sendgrid.key);

/**
 * Cloud Function triggered when a new order is created
 * Sends email notification to admin
 */
export const sendOrderNotification = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;

    try {
      // Get user details
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(order.userId)
        .get();

      const user = userDoc.data();

      // Send email to admin
      const mailOptions = {
        from: functions.config().email.user,
        to: functions.config().email.admin, // Admin email
        subject: `🔔 New Order #${orderId.slice(0, 8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Order Received</h2>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Customer Phone:</strong> ${user?.phoneNumber || 'N/A'}</p>
              <p><strong>Total Amount:</strong> ${order.totalAmount.toLocaleString()} ₮</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>

            <h3>Delivery Address:</h3>
            <p>
              ${order.deliveryAddress.province},
              ${order.deliveryAddress.district},
              ${order.deliveryAddress.khoroo}<br>
              ${order.deliveryAddress.detailedAddress}
            </p>

            <h3>Order Items:</h3>
            <ul>
              ${order.items
                .map(
                  (item: any) =>
                    `<li>${item.product.name.en} x ${item.quantity} = ${(
                      item.product.price * item.quantity
                    ).toLocaleString()} ₮</li>`
                )
                .join('')}
            </ul>

            <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px;">
              <p style="margin: 0; color: #92400e;">
                ⚠️ <strong>Action Required:</strong> Please verify the payment and update the order status in the admin panel.
              </p>
            </div>

            <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
              This is an automated notification from Razor Decor eCommerce system.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Order notification email sent successfully');

      return { success: true };
    } catch (error) {
      console.error('Error sending order notification:', error);
      return { error: 'Failed to send notification' };
    }
  });

/**
 * Set custom claims for admin users
 * This allows Storage rules to check if user is admin via token.role
 */
export const setAdminClaim = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const after = change.after.exists ? change.after.data() : null;
    const before = change.before.exists ? change.before.data() : null;

    // Only update if role changed
    if (!after || (before && before.role === after.role)) {
      return null;
    }

    try {
      // Set custom claim based on role
      const customClaims = {
        role: after.role,
      };

      await admin.auth().setCustomUserClaims(userId, customClaims);
      console.log(`Custom claims set for user ${userId}: role=${after.role}`);

      return { success: true };
    } catch (error) {
      console.error('Error setting custom claims:', error);
      return { error: 'Failed to set custom claims' };
    }
  });

/**
 * Optional: Send order status update notification to customer
 */
export const sendOrderStatusUpdate = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only send email if status changed
    if (before.status === after.status) {
      return null;
    }

    const orderId = context.params.orderId;

    try {
      // Get user details
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(after.userId)
        .get();

      const user = userDoc.data();

      if (!user?.email) {
        console.log('User has no email, skipping notification');
        return null;
      }

      const statusMessages: Record<string, string> = {
        payment_verified: 'Your payment has been verified!',
        in_production: 'Your order is now in production.',
        out_for_delivery: 'Your order is out for delivery!',
        delivered: 'Your order has been delivered. Thank you!',
      };

      const mailOptions = {
        from: functions.config().email.user,
        to: user.email,
        subject: `Order Update - #${orderId.slice(0, 8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Order Status Update</h2>

            <p>Hello,</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Order ID:</strong> #${orderId.slice(0, 8)}</p>
              <p style="font-size: 18px; color: #059669; margin-top: 10px;">
                ✅ ${statusMessages[after.status] || 'Order status updated'}
              </p>
            </div>

            <p>Thank you for shopping with Razor Decor!</p>

            <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
              Razor Decor - Custom Metal Art & CNC Laser Cutting
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Status update email sent successfully');

      return { success: true };
    } catch (error) {
      console.error('Error sending status update:', error);
      return { error: 'Failed to send status update' };
    }
  });
