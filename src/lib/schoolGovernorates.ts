// Single source of truth for Lebanon governorate landing pages (Schools Rebuild
// spec Part C / G1.7). Reserved URL slugs — the slug generator must NEVER assign
// any of these to a school. Imported by the [school] route, the listing island,
// and the sitemap so the three never drift.

// slug → Arabic display name (also the value stored in schools.governorate)
export const GOV_SLUGS: Record<string, string> = {
  beirut: "بيروت",
  "mount-lebanon": "جبل لبنان",
  north: "الشمال",
  akkar: "عكار",
  bekaa: "البقاع",
  "baalbek-hermel": "بعلبك الهرمل",
  south: "الجنوب",
  nabatieh: "النبطية",
};

// Arabic governorate name → slug (reverse map, for building links from data).
export const GOV_SLUG_BY_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(GOV_SLUGS).map(([slug, name]) => [name, slug])
);

// Unique, location-led editorial intros (spec K: no invented stats — the numbers
// row on the page is computed live from the data).
export const GOV_INTRO: Record<string, string> = {
  beirut: "العاصمة بيروت تضمّ أعرق المؤسسات التربوية في لبنان وأكثرها تنوّعاً: من المدارس الرسمية إلى كبرى المدارس الخاصة والدولية التي تُدرّس بالمناهج اللبنانية والفرنسية والإنكليزية. هذا الدليل يجمع مدارس بيروت في مكان واحد ليساعد العائلات على المقارنة والاختيار.",
  "mount-lebanon": "جبل لبنان هو الأوسع تنوّعاً تربوياً في لبنان، بأقضيته الممتدة من المتن وبعبدا إلى الشوف وجبيل وكسروان وعاليه. تجد فيه مدارس خاصة ودولية ودينية عريقة إلى جانب المدارس الرسمية. تصفّح الدليل وقارن حسب المنطقة والمنهج ولغة التعليم.",
  north: "الشمال وعاصمته طرابلس من أغنى المناطق اللبنانية بالمؤسسات التعليمية العريقة، من المدارس الرسمية والخاصة إلى الإرساليات والمقاصد. هذا الدليل يغطي مدارس طرابلس والكورة والمنية-الضنية وسائر مناطق الشمال ليسهّل على الأهل الاختيار.",
  akkar: "عكار من أكثر المحافظات اللبنانية حاجةً لدليل تربوي واضح، بمدارسها الموزّعة على قرى وبلدات واسعة من حلبا إلى فنيدق. يجمع هذا الدليل مدارس عكار الرسمية والخاصة في مكان واحد مع معلومات الموقع والمراحل والمنهج.",
  bekaa: "البقاع بمدنه الرئيسية زحلة وجب جنين يضمّ شبكة متنوعة من المدارس الرسمية والخاصة التي تخدم عائلات السهل من راشيا إلى البقاع الغربي. تصفّح مدارس البقاع وقارن بينها حسب المنطقة والمرحلة التعليمية.",
  "baalbek-hermel": "محافظة بعلبك الهرمل تمتدّ على مساحة واسعة من شمال البقاع، وتخدم مدارسها الرسمية والخاصة مجتمعات مدينية وريفية متنوعة. هذا الدليل يساعد أهالي بعلبك والهرمل وجوارهما على استكشاف الخيارات التعليمية المتاحة.",
  south: "الجنوب بمدنه صيدا وصور وجزين من المناطق الغنية بالمؤسسات التربوية المتنوعة: مدارس رسمية وخاصة وإرساليات عريقة. يجمع هذا الدليل مدارس الجنوب ليسهّل على العائلات المقارنة حسب المنطقة والمنهج ولغة التعليم.",
  nabatieh: "محافظة النبطية قلب الجنوب الداخلي، تضمّ مدارس رسمية وخاصة تخدم النبطية وجوارها. تصفّح دليل مدارس النبطية وقارن بين الخيارات حسب المرحلة التعليمية والمنهج.",
};
