import { Link } from "react-router-dom";
import { CheckCircle, Download, Mail, Calendar, ArrowRight, Home } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const CheckoutSuccess = () => {
  const { items, totalPrice, clearCart } = useCart();
  const orderId = `PC-${Date.now().toString(36).toUpperCase()}`;

  const bundleDiscount = items.length >= 2 ? 0.1 : 0;
  const registrationFee = 50;
  const discountAmount = totalPrice * bundleDiscount;
  const finalTotal = totalPrice - discountAmount + registrationFee;

  // If cart is empty (e.g. direct navigation), show simplified success message
  if (items.length === 0) {
    return (
      <div className="bg-muted min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="container mx-auto max-w-md text-center">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Payment Successful!</h1>
            <p className="text-muted-foreground text-sm mb-8">
              Thank you for your enrollment. Your payment has been processed successfully. 
              Check your email for your receipt and login details.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/learner/dashboard"
                className="w-full inline-flex justify-center items-center gap-2 bg-primary text-primary-foreground h-11 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Go to My Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/"
                className="w-full inline-flex justify-center items-center gap-2 bg-secondary text-secondary-foreground h-11 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Success Card */}
        <div className="bg-card border border-border rounded-2xl p-8 text-center mb-8 shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Enrollment Successful!</h1>
          <p className="text-muted-foreground text-sm">
            Thank you for enrolling with The Prime College. A confirmation email has been sent to your inbox.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-foreground">Enrollment Details</h2>
            <span className="text-xs font-mono font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">ID: {orderId}</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="border-t border-border pt-4">
              <p className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-wider">Enrolled Course{items.length > 1 ? 's' : ''}</p>
              {items.map((item) => (
                <div key={item.slug} className="flex justify-between py-2">
                  <div className="flex-1">
                    <span className="text-foreground font-semibold">{item.title}</span>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{item.level}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{item.duration}</span>
                    </div>
                  </div>
                  <span className="text-foreground font-bold shrink-0 ml-4">{item.price}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>£{totalPrice.toLocaleString()}</span>
              </div>
              {bundleDiscount > 0 && (
                <div className="flex justify-between text-secondary-foreground font-medium">
                  <span>Bundle Discount (10%)</span>
                  <span>-£{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Registration Fee</span>
                <span>£{registrationFee}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
                <span className="text-foreground">Total Paid</span>
                <span className="text-primary">£{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-6">What Happens Next?</h2>
          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Check Your Email</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">You'll receive a welcome email with login credentials for the learning portal within 24 hours.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Induction Session</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">Our team will contact you to schedule your induction and orientation session.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Course Materials</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">Access your course materials and study resources through the learning portal once activated.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/learner/dashboard"
            onClick={() => clearCart()}
            className="flex-1 bg-primary text-primary-foreground h-12 rounded-lg font-bold text-sm text-center hover:opacity-90 flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            Go to My Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            onClick={() => clearCart()}
            className="flex-1 bg-card border border-border text-foreground h-12 rounded-lg font-bold text-sm text-center hover:bg-muted flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
