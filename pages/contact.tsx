import Footer from "../components/Footer";
import SiteNav from "../components/SiteNav";
import ContactForm from "../components/form/ContactForm";

export default function LandingPage() {
  return (
    <>
      <SiteNav pageTitle="Nance | Automate Your Governance" withProposalButton={false} withSiteSuffixInTitle={false} />
      <div className="bg-blue-50 p-6 rounded-md shadow-md text-center text-lg font-semibold text-blue-800 mt-10 mx-auto lg:w-1/4 sm:w-1/2">
        Need help or have a question? Fill out the form below and we will get back to you as soon as possible.
        Or join our <a href="https://discord.gg/eHv5kwbgGE" className="underline">Discord</a> for a faster response
      </div>
      <ContactForm />
      <Footer />
    </>
  );
}
