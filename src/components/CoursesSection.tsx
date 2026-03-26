import courseSmma from "@/assets/course-smma.jpg";
import courseBlog from "@/assets/course-blog.jpg";
import courseYoutube from "@/assets/course-youtube.jpg";
import courseAffiliation from "@/assets/course-affiliation.jpg";
import courseEcommerce from "@/assets/course-ecommerce.jpg";
import courseAi from "@/assets/course-ai.jpg";

const courses = [
  {
    title: "Créez votre agence SMMA : gagnez 1000€ par mois",
    image: courseSmma,
    oldPrice: "30 $",
    price: "10 $",
  },
  {
    title: "Création de blog rentable et automatisé",
    image: courseBlog,
    oldPrice: "80 $",
    price: "10 $",
  },
  {
    title: "Gagnez de l'argent sur YouTube",
    image: courseYoutube,
    oldPrice: "80 $",
    price: "10 $",
  },
  {
    title: "Réussir dans l'affiliation : 1000€ par mois",
    image: courseAffiliation,
    oldPrice: "80 $",
    price: "10 $",
  },
  {
    title: "Créez votre boutique en ligne et boostez vos ventes",
    image: courseEcommerce,
    oldPrice: "80 $",
    price: "10 $",
  },
  {
    title: "Formation complète intelligence artificielle",
    image: courseAi,
    oldPrice: "60 $",
    price: "10 $",
  },
];

const CoursesSection = () => {
  return (
    <section id="formations" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nos Formations
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Acquérez les compétences digitales de demain aujourd'hui
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.title} className="course-card rounded-xl overflow-hidden">
              <div className="relative">
                <span className="absolute top-3 left-3 badge-purple text-xs font-semibold px-3 py-1 rounded-full z-10">
                  Promo !
                </span>
                <img
                  src={course.image}
                  alt={course.title}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-5 space-y-3">
                <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
                  {course.title}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground line-through text-sm">
                    {course.oldPrice}
                  </span>
                  <span className="text-accent font-bold text-lg">{course.price}</span>
                </div>
                <button className="w-full btn-primary-brand py-2.5 rounded-lg font-semibold text-sm">
                  ACHETER MAINTENANT
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="#"
            className="btn-primary-brand inline-block px-8 py-3 rounded-lg font-semibold"
          >
            VOIR TOUTES NOS FORMATIONS
          </a>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
