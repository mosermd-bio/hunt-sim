# Gut Microbiome Diet Trajectory Simulator

An interactive browser-based tool to visualize phased dietary interventions on gut microbial composition. Users can select genetic baselines, dietary factors (protective vs. detrimental), phase durations, and append multiple phases to model long-term trajectories. Built with HTML, CSS, JavaScript, and Chart.js.

## Features
- **Genetic baselines** (Phase 1): Typical European secretor + lactase-persistent, FUT2 non-secretor, or lactase non-persistent.
- **Dietary factors** (multi-select): Red/processed meat, fried foods, soda, emulsifiers, alcohol, high dairy (detrimental); high-fiber plants, berries/polyphenols, EVOO, fermented foods (protective).
- **Phase duration**: Adjustable from 7–365 days (weekly steps).
- **Views**: Line chart (individual abundances), stacked area (cumulative), alpha-diversity (Shannon H' and Simpson 1-D).
- **Hover tooltips**: Show daily abundances + diversity metrics.
- **Append phases**: Build cumulative trajectories over months/years.
- **Reset & status updates**.

## Scientific Basis
This simulator provides a pretty accurate representation of how dietary changes influence the gut microbiome, grounded in well-established research as of 2025–2026. It captures the rapid diet–microbiome plasticity demonstrated in landmark studies, such as David et al. (Nature, 2014), where shifts in microbial community structure occur within days of major dietary alterations (e.g., plant-based vs. animal-based diets). The model emphasizes relative abundance shifts of resident taxa rather than wholesale colonization of new species—mirroring adult human reality, where diet primarily modulates existing populations through bloom/decline dynamics (e.g., enrichment of SCFA-producing taxa like *Bifidobacterium adolescentis* and *Faecalibacterium*-related species via high-fiber plants, berries/polyphenols, fermented foods, and olive oil, while Western-style factors like red/processed meat, emulsifiers, and alcohol promote pathobionts such as *Bilophila wadsworthia*, a classic marker of bile-tolerant, taurine-utilizing bacteria thriving on animal-fat-rich diets). The inclusion of genetic baselines (FUT2 non-secretor and lactase non-persistence) correctly highlights host genetic modifiers that influence starting abundances (e.g., reduced *Bifidobacterium* in non-secretors) and personalized responses—key concepts in precision nutrition from GWAS and functional genomics. Recent large-scale GWAS studies further reinforce host genetic influences on microbiota composition, identifying reproducible associations at loci including FUT2, LCT, ABO, HLA-DQB1, and others. The slight stochastic decay/random factor (`0.995 + Math.random() * 0.01`) nicely nods to real biological noise and microbiome resilience, while the phased, appendable structure illustrates why sustained, long-term dietary adherence outperforms yo-yo patterns: short-term shifts are rapid but often reversible, whereas consistent "good habit" phases yield more stable, health-beneficial trajectories, aligning with systematic reviews of dietary interventions (e.g., 4 days to 1 year, with most >4 weeks showing directional enrichment of beneficial taxa, as in recent comprehensive analyses of 80+ controlled trials emphasizing Mediterranean, plant-based, and polyphenol-rich patterns) and large cohort studies linking specific microbes to diet and health markers via rankings like the ZOE Microbiome Health Ranking 2025.

## Disclaimer
This educational simulator illustrates **average directional effects** of diet on gut microbial relative abundances based on published research trends. Real-world responses show huge inter-individual variation due to host genetics (e.g., FUT2/LCT variants), baseline microbiome composition, adherence level, and other factors—your personal outcome may differ significantly. The model does not simulate full reversion to baseline when a phase ends (real microbiomes often exhibit partial resilience/memory), but appending phases assumes continued good habits, which is appropriate for motivational purposes. All values are relative percentages (standard in microbiome studies from 16S/shotgun sequencing); absolute bacterial biomass or strain-level details are not modeled, as these are challenging in a simple browser tool.

## Usage
1. Open `index.html` in a modern browser.
2. Select baseline, foods, and phase length.
3. Click "Run Phase (Reset)" for the first simulation or "Append Phase" to extend.
4. Switch views and hover for details.

## Limitations & Educational Note
This is a simplified motivational/educational model (not a predictive clinical tool). It draws from key concepts in human genomics and microbiome research. For real applications, consult metagenomic studies, personalized nutrition testing, or healthcare professionals.

## References
1. David LA, Maurice CF, Carmody RN, et al. Diet rapidly and reproducibly alters the human gut microbiome. Nature. 2014;505(7484):559-563. doi:10.1038/nature12820

2. Aslam H, Trakman G, Dissanayake T, et al. Dietary interventions and the gut microbiota: a systematic literature review of 80 controlled clinical trials. J Transl Med. 2026;24:39. doi:10.1186/s12967-025-07428-9

3. Asnicar F, Manghi P, Fackelmann G, et al. Gut micro-organisms associated with health, nutrition and dietary interventions. Nature. 2025;650(8101):450-458. doi:10.1038/s41586-025-09854-7

4. Moksnes MR, Nethander M, Grahnemo L, et al. The HUNT study identifies host genetic factors reproducibly associated with human gut microbiota composition. Nat Genet. 2026. doi:10.1038/s41588-026-02502-4 (Online ahead of print)

5. Dekkers KF, Pertiwi K, Baldanzi G, et al. Genome-wide association analyses highlight the role of the intestinal molecular environment in human gut microbiota variation. Nat Genet. 2026. doi:10.1038/s41588-026-02512-2 (Online ahead of print)

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

### Attribution
If you use this tool (in research, publications, pipelines, derivatives, or any other work), please credit me:

**Matt Moser**  
GitHub: [https://github.com/mosermd-bio/hunt-sim](https://github.com/mosermd-bio/hunt-sim)

Example citation (for papers/posters/talks):
mosermd. (2026). Gut Microbiome Diet Trajectory Simulator. GitHub repository. https://github.com/mosermd-bio/hunt-sim

Thanks for your support — happy to discuss collaborations or improvements!

-Matt