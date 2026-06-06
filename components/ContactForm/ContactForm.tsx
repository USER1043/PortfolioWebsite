/**
 * @file Contact form that opens the user's mail client via mailto: action.
 * @module components/ContactForm
 */

// Renders a glassmorphic contact form; no JS state needed (native mailto action).
export default function ContactForm() {
  return (
    <section className="backdrop-blur-[18px] saturate-[130%] bg-[rgba(255,255,255,0.72)] rounded-[24px] border border-[rgba(227,237,230,0.9)] shadow-[0_14px_40px_rgba(0,0,0,0.06)] p-[22px_22px_26px] mb-10">
      <h2 className="text-[20px] font-[650] mb-2">Send a message</h2>
      <p className="text-[13px] text-[#6b7e75] mb-3.5">
        Whether it&apos;s internships, projects, research, or collaboration — I&apos;d love to hear from you.
      </p>

      <form className="flex flex-col gap-2.5" action="mailto:prjnkrthk@gmail.com" method="POST">
        <input
          type="text"
          name="name"
          placeholder="Your name"
          required
          className="font-[inherit] text-sm px-3 py-2.5 rounded-[12px] border border-black/[0.08] bg-[rgba(255,255,255,0.85)] outline-none focus:ring-2 focus:ring-[#0faf64]/30"
        />
        <input
          type="email"
          name="email"
          placeholder="Your email"
          required
          className="font-[inherit] text-sm px-3 py-2.5 rounded-[12px] border border-black/[0.08] bg-[rgba(255,255,255,0.85)] outline-none focus:ring-2 focus:ring-[#0faf64]/30"
        />
        <textarea
          name="message"
          placeholder="Your message"
          required
          className="font-[inherit] text-sm px-3 py-2.5 rounded-[12px] border border-black/[0.08] bg-[rgba(255,255,255,0.85)] min-h-[120px] resize-y outline-none focus:ring-2 focus:ring-[#0faf64]/30"
        />
        <button
          type="submit"
          className="h-[42px] rounded-full bg-gradient-to-r from-[#0faf64] to-[#0a8a50] text-white text-sm font-medium shadow-[0_6px_20px_rgba(12,112,80,0.35)] hover:brightness-[1.13] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-none"
        >
          Send message 💬
        </button>
      </form>

      <p className="mt-2.5 text-[11px] text-[#6b7e75]">PS: This form opens your mail app.</p>
    </section>
  );
}
