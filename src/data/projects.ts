export interface Project {
  title: string;
  tag: string;
  description: string;
  image: string;
  link: string;
}

export const projects: Project[] = [
  {
    title: "Kyshi",
    tag: "Neobank · Fintech",
    description:
      "A neobank giving Africans a simple, secure way to transact across borders. Built a peer-to-peer marketplace where users create and accept offers at convenient rates.",
    image: "/assets/kyshi.png",
    link: "https://kyshi.co",
  },
  {
    title: "Bento Africa",
    tag: "HR & Payroll · iOS",
    description:
      "A cloud-based salaries and benefits platform that reimagines HRM from the ground up, helping businesses do more with less.",
    image: "/assets/bento.png",
    link: "https://apps.apple.com/ng/app/bento-africa/id1473686223",
  },
  {
    title: "Identigo",
    tag: "Verification · iOS",
    description:
      "End-to-end background verification: employee history, domestic staff screening, business compliance and due-diligence assurance.",
    image: "/assets/identigo.png",
    link: "https://apps.apple.com/ng/app/identigo/id6451416797",
  },
  {
    title: "Cubex",
    tag: "Crypto Payments",
    description:
      "An alternative payment platform enabling everyday use of cryptocurrencies and gift cards, with instant remittance solutions for users.",
    image: "/assets/cubex.png",
    link: "https://play.google.com/store/apps/details?id=com.cubex.app",
  },
  {
    title: "AlajeHub",
    tag: "Trading · Marketplace",
    description:
      "A digital trading app connecting buyers and sellers of digital assets and stores-of-value across the world.",
    image: "/assets/alaje.png",
    link: "https://play.google.com/store/apps/details?id=com.alajehub.alajemobile",
  },
  {
    title: "MyTime",
    tag: "HRM · Face Clock-in",
    description:
      "A Bento application where employees clock in and out of shifts and breaks by scanning their faces.",
    image: "/assets/mytime.png",
    link: "https://play.google.com/store/apps/details?id=com.bento.mytime",
  },
  {
    title: "Deep Learning Applied",
    tag: "ML · Python",
    description:
      "An interactive app showcasing real-world deep learning: sentiment analysis, image-to-text NLP, classifiers and on-device AI behaviour via the camera.",
    image: "/assets/deep.png",
    link: "https://play.google.com/store/apps/details?id=com.deep.machine_deep_learning",
  },
  {
    title: "Twizll",
    tag: "E-commerce",
    description:
      "Secure and convenient shopping for limited-edition, bespoke African fashion designs, delivered to your door.",
    image: "/assets/twizll2.png",
    link: "https://play.google.com/store/apps/details?id=com.twizll.twizllapp",
  },
];

export const techStack: string[] = [
  "Flutter",
  "Swift",
  "TypeScript",
  "React",
  "Dart",
  "JavaScript",
  "Python",
  "Java",
  "Node.js",
  "Three.js",
  "GSAP",
  "Firebase",
];

export const socials = [
  { name: "GitHub", url: "https://github.com/gbolahan146", icon: "/assets/contacts/github.svg" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/gbolahanoduyemi/", icon: "/assets/contacts/linkedIn.svg" },
  { name: "Twitter", url: "https://twitter.com/its_gbolahan", icon: "/assets/contacts/twitter.svg" },
  { name: "Instagram", url: "https://www.instagram.com/itsgbolahan/", icon: "/assets/contacts/Instagram.svg" },
  { name: "Facebook", url: "https://facebook.com/gbolahan.oduyemi.395", icon: "/assets/contacts/facebook.svg" },
];

export const RESUME_URL = "https://docdro.id/osXMO7a";
export const EMAIL = "gbolahanoduyemi1@gmail.com";
