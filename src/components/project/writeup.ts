import Accordion from "./Accordion.astro";
import Callout from "./Callout.astro";
import Card from "./Card.astro";
import Cards from "./Cards.astro";
import Details from "./Details.astro";
import Figure from "./Figure.astro";
import ProjectImage from "./ProjectImage.astro";
import Term from "./Term.astro";

// Components available in every project writeup without an import. Passed to
// the rendered MDX, which resolves any tag it doesn't find in scope from here.
export const writeupComponents = {
  Accordion,
  Callout,
  Card,
  Cards,
  Details,
  Figure,
  ProjectImage,
  Term,
};
