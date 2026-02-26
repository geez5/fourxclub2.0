const fs = require('fs');

let content = fs.readFileSync('src/components/HomePageClients.tsx', 'utf-8');

// 1. Imports
content = content.replace(
    "import RazorpayCheckout from './RazorpayCheckout';",
    "import RazorpayCheckout from './RazorpayCheckout';\nimport { motion, useScroll, useTransform } from 'framer-motion';"
);

// 2. State & Scroll Hook
content = content.replace(
    "const [hasCourseAccess, setHasCourseAccess] = useState(false);",
    `const [hasCourseAccess, setHasCourseAccess] = useState(false);

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1500], ['0%', '30%']);
  const backgroundOpacity = useTransform(scrollY, [0, 800], [0.6, 0.0]);

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: "easeOut" as any }
  };`
);

// 3. Colors
content = content.replace(
    /const bgPrimary = '#0a0a0a';/g,
    "const bgPrimary = '#000000';"
).replace(
    /const bgCard = '#151515';/g,
    "const bgCard = 'rgba(10, 10, 10, 0.8)';"
).replace(
    /const borderColor = '#3a3a3a';/g,
    "const borderColor = 'rgba(255, 255, 255, 0.1)';"
);

// 4. Return wrapper
content = content.replace(
    '<div className="min-h-screen" style={{ backgroundColor: bgPrimary, color: textLight }}>',
    `<div className="min-h-screen relative" style={{ backgroundColor: '#000000', color: textLight }}>
      {/* Dynamic Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ backgroundColor: '#000' }}>
        <motion.div 
          className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-top"
          style={{ 
            backgroundImage: "url('/chart-bg.png')",
            y: backgroundY,
            opacity: backgroundOpacity,
            mixBlendMode: 'screen',
            filter: 'contrast(1.2) sepia(0.2) hue-rotate(80deg)' // green/purple tint
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/90 to-black"></div>
      </div>
      
      <div className="relative z-10 w-full h-full">`
);

// To close the new wrapper <div className="relative z-10">, we need to insert a </div> 
// right before the last closing </div> of the component returns.
// The file ends with:
//       )}
//     </div>
//   );
// }
const EOF_STRING = "    </div>\n  );\n}";
const NEW_EOF_STRING = "      </div>\n    </div>\n  );\n}";
content = content.replace(EOF_STRING, NEW_EOF_STRING);


// 5. Sections
content = content.replace(/<section className="relative pt-32/g, '<motion.section {...fadeInUp} className="relative pt-32');
content = content.replace(/<section id="about" /g, '<motion.section {...fadeInUp} id="about" ');
content = content.replace(/<section id="course" /g, '<motion.section {...fadeInUp} id="course" ');
content = content.replace(/<section id="community" /g, '<motion.section {...fadeInUp} id="community" ');
content = content.replace(/<section id="pricing" /g, '<motion.section {...fadeInUp} id="pricing" ');
content = content.replace(/<section className="py-20 md:py-32 relative/g, '<motion.section {...fadeInUp} className="py-20 md:py-32 relative');

content = content.replace(/<\/section>/g, '</motion.section>');

// Replace background colors in sections with transparent or glassmorphism
content = content.replace(/style={{ backgroundColor: bgCard }}/g, `style={{ backgroundColor: 'transparent' }}`);
content = content.replace(/style={{ backgroundColor: bgPrimary }}/g, `style={{ backgroundColor: 'transparent' }}`);
content = content.replace(/style={{ backgroundColor: \`\${bgPrimary}80\`,\s*borderBottom:/g, "style={{ backgroundColor: `rgba(0,0,0,0.6)`,\n        backdropFilter: 'blur(12px)',\n        borderBottom:");
content = content.replace(/style={{ backgroundColor: bgCard, borderTop:/g, "style={{ backgroundColor: 'transparent', borderTop:");

fs.writeFileSync('src/components/HomePageClients.tsx', content, 'utf-8');
console.log('HomePageClients rewritten successfully.');
