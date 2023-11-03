import { Footer, SiteNav } from "@/components/Site";
import ContactForm from "../components/form/ContactForm";

export default function LandingPage() {
  return (
    <>
      <SiteNav
        pageTitle="Nance | Automate Your Governance"
        withProposalButton={false}
        withSiteSuffixInTitle={false}
      />
      <div className="mx-auto mt-10 rounded-md bg-blue-50 p-6 text-center text-lg font-semibold text-blue-800 shadow-md sm:w-1/2 lg:w-1/4">
        Need help or have a question? Fill out the form below and we will get
        back to you as soon as possible. Or join our{" "}
        <a href="https://discord.gg/eHv5kwbgGE" className="underline">
          Discord
        </a>{" "}
        for a faster response
      </div>
      <ContactForm />
      <Footer />
    </>
  );
}
