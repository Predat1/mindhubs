import { Link } from "react-router-dom";
import courseSmma from "@/assets/course-smma.jpg";
import courseBlog from "@/assets/course-blog.jpg";
import courseYoutube from "@/assets/course-youtube.jpg";
import courseAffiliation from "@/assets/course-affiliation.jpg";
import courseEcommerce from "@/assets/course-ecommerce.jpg";
import courseAi from "@/assets/course-ai.jpg";
import courseChien from "@/assets/course-chien.jpg";
import courseEloquence from "@/assets/course-eloquence.jpg";

const courses = [
  { title: "Créez votre agence SMMA : gagnez 1000€ par mois", image: courseSmma, oldPrice: "30 $", price: "10 $" },
  { title: "Création de blog rentable et automatisé", image: courseBlog, oldPrice: "80 $", price: "10 $" },
  { title: "Gagnez de l'argent sur YouTube", image: courseYoutube, oldPrice: "80 $", price: "10 $" },
  { title: "Réussir dans l'affiliation : 1000€ par mois", image: courseAffiliation, oldPrice: "80 $", price: "10 $" },
  { title: "Créez votre boutique en ligne et boostez vos ventes", image: courseEcommerce, oldPrice: "80 $", price: "10 $" },
  { title: "Apprenez à dresser efficacement votre chien", image: courseChien, oldPrice: "60 $", price: "10 $" },
  { title: "Apprenez à parler avec éloquence", image: courseEloquence, oldPrice: "70 $", price: "10 $", rating: 5 },
  { title: "Formation complète intelligence artificielle", image: courseAi, oldPrice: "60 $", price: "10 $" },
];

const CoursesSection = () => {
  return (
    <section id="formations" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Title in bordered card */}
        <div className="stat-card rounded-2xl py-8 px-6 text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Nos Formations
          </h2>
          <p className="text-muted-foreground text-sm">
            Acquérez les compétences digitales de demain aujourd'hui
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {courses.map((course) => (
            <div key={course.title} className="course-card rounded-xl overflow-hidden">
              <div className="relative">
                <span className="absolute top-2 left-2 badge-purple text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
                  Promo !
                </span>
                <img
                  src={course.image}
                  alt={course.title}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="w-full h-36 md:h-44 object-cover"
                />
              </div>
              <div className="p-3 md:p-4 space-y-2">
                <h3 className="font-semibold text-foreground text-xs md:text-sm leading-snug line-clamp-2 min-h-[2rem]">
                  {course.title}
                </h3>
                {course.rating && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="w-3 h-3 text-accent fill-accent" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground line-through text-xs">{course.oldPrice}</span>
                  <span className="text-accent font-bold text-base">{course.price}</span>
                </div>
                <button className="w-full btn-primary-brand py-2 rounded-lg font-semibold text-xs">
                  ACHETER MAINTENANT
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/boutique"
            className="btn-primary-brand inline-block px-8 py-3 rounded-lg font-semibold text-sm"
          >
            VOIR TOUTES NOS FORMATIONS
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
