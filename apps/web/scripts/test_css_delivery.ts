async function main() {
  console.log('--- TESTING DEV SERVER CSS DELIVERY ---');
  const port = process.env.PORT || '3005';
  const base = `http://localhost:${port}`;
  
  const res = await fetch(`${base}/`);
  console.log(`GET / Status: ${res.status}`);
  const html = await res.text();
  
  const cssMatches = Array.from(html.matchAll(/href="(\/_next\/static\/css\/[^"]+)"/g));
  console.log(`Found ${cssMatches.length} CSS link tags in rendered HTML:`);
  
  for (const match of cssMatches) {
    const cssPath = match[1];
    const cssUrl = `${base}${cssPath}`;
    const cssRes = await fetch(cssUrl);
    const cssText = await cssRes.text();
    console.log(`  -> CSS Link: ${cssPath}`);
    console.log(`     HTTP Status: ${cssRes.status}`);
    console.log(`     Byte Length: ${cssText.length}`);
    console.log(`     Has .bg-prism-bg-canvas: ${cssText.includes('bg-prism-bg-canvas')}`);
    console.log(`     Has .shadow-prism-card: ${cssText.includes('shadow-prism-card')}`);
    console.log(`     Has .rounded-xl: ${cssText.includes('rounded-xl')}`);
    
    if (cssRes.status !== 200 || !cssText.includes('bg-prism-bg-canvas')) {
      console.error('FAILED: CSS was not delivered with 200 OK or is missing Tailwind rules!');
      process.exit(1);
    }
  }

  // Also test a sample page like /insights, /ask, /explorer
  for (const page of ['/insights', '/ask', '/explorer', '/sources']) {
    const pRes = await fetch(`${base}${page}`);
    console.log(`GET ${page} Status: ${pRes.status}`);
  }
  
  console.log('SUCCESS: All CSS assets verified with 200 OK and valid Tailwind utility classes!');
}

main().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
