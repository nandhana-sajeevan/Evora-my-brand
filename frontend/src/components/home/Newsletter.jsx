import { useState } from "react";
import api, { formatApiErrorDetail } from "../../lib/api";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { data } = await api.post("/newsletter", { email });
      if (data?.already_subscribed) {
        toast("You're already on the list.", { description: "Stay tuned for new drops." });
      } else {
        toast("Welcome to ÉVORA.", { description: "First access, every season." });
      }
      setEmail("");
    } catch (e) {
      toast("Subscription failed", { description: formatApiErrorDetail(e.response?.data?.detail) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section data-testid="newsletter" className="section-y container-fluid">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-eyebrow opacity-60">06 — The Letter</p>
        <h2 className="font-serif text-4xl md:text-6xl font-light leading-[0.95] mt-4">
          First access. Every season.
        </h2>
        <p className="mt-6 text-base opacity-70 max-w-lg mx-auto leading-relaxed">
          Receive private invitations to capsule releases, atelier essays, and quiet moments from the house.
        </p>

        <form onSubmit={submit} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            data-testid="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-transparent border border-border px-5 py-4 text-sm outline-none focus:border-foreground"
          />
          <button
            data-testid="newsletter-submit"
            disabled={loading}
            type="submit"
            className="bg-foreground text-background px-7 py-4 text-eyebrow inline-flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Subscribe"}
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </form>
        <p className="text-[11px] opacity-50 mt-4 tracking-wide">By subscribing you agree to our privacy practices.</p>
      </div>
    </section>
  );
}
