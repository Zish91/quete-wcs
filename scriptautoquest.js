
📷 Capture d'écran : https://raw.githubusercontent.com/Zish91/quete-wcs/main/ressources/automatisationquest.png

###
I.Script de collecte des ID 
                             ###
(async function() {
  const seen = new Set();

  function collectLinks() {
    document.querySelectorAll('a[href^="/quests/"]').forEach(a => {
      seen.add(a.getAttribute('href'));
    });
  }

  function clickPage(n) {
    const btn = document.querySelector(`button[aria-label="Go to page ${n}"]`);
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }

  collectLinks();
  console.log(`Page 1 ➜ total cumulé : ${seen.size}`);

  // Ajuste maxPage si le nombre de pages change (vérifie le total affiché)
  const maxPage = 5;

  for (let page = 2; page <= maxPage; page++) {
    const ok = clickPage(page);
    if (!ok) {
      console.log(`⚠️ Bouton page ${page} non trouvé.`);
      break;
    }
    await new Promise(r => setTimeout(r, 1200));
    collectLinks();
    console.log(`Page ${page} ➜ total cumulé : ${seen.size}`);
  }

  const links = Array.from(seen).map(href => href.replace('/quests/', ''));
  console.log(`✅ Total final : ${links.length} IDs uniques`);
  console.log(JSON.stringify(links));
})();


###
II. Script à coller dans la console pour démarrer (sur la page /quests avec tous les filtres cochés,     
  après avoir récupéré la liste des IDs via le script de collecte des ID) :
                                                                                              ###

(function() {
  const ids = ["1949","1950","1944","3966","1945","296","517","2503","2924","3092","3960","3976","3977","3033","3035","3590","3020","3957","3958","3959","3075","3077","2365","2799","2935","2850","2777","2860","3036","3054","3903","2883","2390","2852","3066","2874","3573","2372","1676","2359","2983","1951","2791","2794","1453","1445","1454","1444","2291","3912","3021","2277","2416","2335","3918","2338","2080","703","2998","2063","2426","2133","1309","2138","1313","1312","1311","2129","1410","2790","2082","1390","2337","2367","3936","2200","3129","2294","2471","2464","2270","3504","2538","3105","1545","2246","629","3084","2006","2039","2030","2781","2768","2409","2410","3041","3963","2878","3962","2848","3581","3582","3583","3135","2861","2866","2873","2103","3964","2356","2358","2316","2041","3961","3978","2934","2350","3042","3823","1977","2274","2114","1315","1316","701"];

  localStorage.setItem('odyssey_scrape_state', JSON.stringify({
    ids: ids,
    index: 0,
    results: [],
    active: true
  }));

  console.log(`🚀 Démarrage ! ${ids.length} quêtes en file.`);
  window.location.href = '/quests/' + ids[0];
})();


###
III. Script Tampermonkey
                           ###

Tampermonkey :


// ==UserScript==
// @name         Odyssey Scraper
// @namespace    odyssey-scraper
// @version      1.1
// @description  Extraction automatique des quêtes Odyssey
// @match        https://odyssey.wildcodeschool.com/quests/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('🟢 [Odyssey Scraper] Script chargé sur', window.location.pathname);

    const STORAGE_KEY = 'odyssey_scrape_state';

    function getState() {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function saveState(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function extractMarkdown() {
        const content = document.querySelector('div.css-1fpw8tv');
        if (!content) return null;

        // Récupère le titre de la quête (en dehors du conteneur de contenu)
        let title = '';
        const titleEl = document.querySelector('h1, h2, [class*="title"]');
        // Cherche plus précisément le titre affiché en haut de page (hors contenu)
        const headerTitle = Array.from(document.querySelectorAll('div, h1, h2'))
            .find(el => el.textContent && el.textContent.trim().length > 0 && !content.contains(el) && el.tagName !== 'DIV');
        if (document.title) title = document.title.replace(' - Odyssey', '').replace('Odyssey', '').trim();

        const clone = content.cloneNode(true);
        clone.querySelectorAll('h1 a, h2 a, h3 a').forEach(a => a.remove());
        clone.querySelectorAll('svg, button').forEach(el => el.remove());

        function htmlToMd(node) {
            let md = '';
            node.childNodes.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    md += child.textContent;
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    const tag = child.tagName.toLowerCase();

                    if (tag === 'table') {
                        const rows = Array.from(child.querySelectorAll('tr'));
                        rows.forEach((row, i) => {
                            const cells = Array.from(row.querySelectorAll('th, td')).map(c => htmlToMd(c).trim());
                            md += `| ${cells.join(' | ')} |\n`;
                            if (i === 0) md += `| ${cells.map(() => '---').join(' | ')} |\n`;
                        });
                        md += '\n';
                        return;
                    }

                    const inner = htmlToMd(child);
                    if (tag === 'h1') md += `\n# ${inner.trim()}\n\n`;
                    else if (tag === 'h2') md += `\n## ${inner.trim()}\n\n`;
                    else if (tag === 'h3') md += `\n### ${inner.trim()}\n\n`;
                    else if (tag === 'p') md += `${inner}\n\n`;
                    else if (tag === 'em' || tag === 'i') md += `*${inner}*`;
                    else if (tag === 'strong' || tag === 'b') md += `**${inner}**`;
                    else if (tag === 'br') md += `\n`;
                    else if (tag === 'pre') md += `\n\`\`\`\n${child.textContent.trim()}\n\`\`\`\n\n`;
                    else if (tag === 'code') md += `\`${child.textContent}\``;
                    else if (tag === 'ul') md += `${inner}\n`;
                    else if (tag === 'li') md += `- ${inner.trim()}\n`;
                    else if (tag === 'img') md += '';
                    else if (tag === 'a') md += `[${inner}](${child.href})`;
                    else if (tag === 'div' || tag === 'article') md += `${inner}\n`;
                    else md += inner;
                }
            });
            return md;
        }

        const body = htmlToMd(clone).replace(/\n{3,}/g, '\n\n').trim();
        const titleLine = title ? `# ${title}\n\n` : '';
        return titleLine + body;
    }

    function showFinalResult(state) {
        const banner = document.createElement('div');
        banner.style = 'position:fixed;top:0;left:0;right:0;background:#111;color:#0f0;padding:20px;z-index:99999;font-family:monospace;max-height:90vh;overflow:auto;';
        const textarea = document.createElement('textarea');
        textarea.style = 'width:100%;height:400px;background:#000;color:#0f0;font-family:monospace;';
        textarea.value = state.results.map(r => `\n\n========================================\nQUEST ID: ${r.id}\nURL: ${r.url}\n========================================\n\n${r.markdown}`).join('\n');
        banner.innerHTML = `<h2>✅ Terminé ! ${state.results.length}/${state.ids.length} quêtes extraites</h2><p>Sélectionne tout le texte ci-dessous (Ctrl+A puis Ctrl+C) :</p>`;
        banner.appendChild(textarea);
        document.body.appendChild(banner);
    }

    function run() {
        const state = getState();
        console.log('🔵 [Odyssey Scraper] État lu :', state);

        if (!state || !state.active) {
            console.log('⚪ [Odyssey Scraper] Pas actif, on arrête.');
            return;
        }

        const currentId = state.ids[state.index];
        const expectedPath = '/quests/' + currentId;
        console.log(`🟡 [Odyssey Scraper] index=${state.index}, currentId=${currentId}, expectedPath=${expectedPath}, actualPath=${window.location.pathname}`);

        if (!window.location.pathname.startsWith(expectedPath)) {
            console.log('⚠️ [Odyssey Scraper] Chemin ne correspond pas, on attend.');
            return;
        }

        const markdown = extractMarkdown();
        console.log('🟣 [Odyssey Scraper] Markdown extrait, longueur =', markdown ? markdown.length : 'NULL');

        state.results.push({
            id: currentId,
            url: window.location.href,
            markdown: markdown || '⚠️ CONTENU NON TROUVÉ'
        });
        state.index++;

        console.log(`✅ [Odyssey Scraper] Quête ${currentId} extraite (${state.index}/${state.ids.length})`);

        if (state.index >= state.ids.length) {
            state.active = false;
            saveState(state);
            console.log('🏁 [Odyssey Scraper] TERMINÉ !');
            showFinalResult(state);
        } else {
            saveState(state);
            const nextId = state.ids[state.index];
            console.log('➡️ [Odyssey Scraper] Navigation vers', nextId);
            setTimeout(function() {
                window.location.href = '/quests/' + nextId;
            }, 500);
        }
    }

    window.addEventListener('load', function() {
        console.log('🟠 [Odyssey Scraper] Event load déclenché, attente 5s...');
        setTimeout(run, 5000);
    });

    if (document.readyState === 'complete') {
        console.log('🟠 [Odyssey Scraper] Document déjà complete, attente 5s...');
        setTimeout(run, 5000);
    }
})();
