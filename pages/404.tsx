import { SiteNav } from "@/components/Site";
import ContentNotFound from "@/components/ContentNotFound";

export default function Custom404({ errMsg }: { errMsg?: string }) {
  const imageSrc = "/images/character/Empty_orange_2.png";
  const errLabel =
    errMsg ||
    "Sorry, we can't find that page. You'll find lots to explore on the home page.";

  return (
    <>
      <SiteNav pageTitle="Not Found" description={errLabel} image={imageSrc} />

      <ContentNotFound
        title="Page Not Found"
        reason={errLabel}
        recommendationText="Do you want to contact us?"
        recommendationActionHref="/contact"
        recommendationActionText="Contact us"
        fallbackActionHref="/"
        fallbackActionText="Back to Home"
      />
    </>
  );
}
