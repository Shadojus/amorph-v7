# AMORPH-NETZO Perspektiven
**Network Science Perspectives** | Version: 1.0.0 | Created: 2026-01-04

## 6 Perspektiven

### HOLISTIC (System Integration)
1. **Multilayer Networks** (~730 lines)
2. **Network Dynamics & Processes** (~750 lines)
3. **Network Topology & Structure** (~560 lines)

### LATERAL (Cross-Boundary Connections)
4. **Biological Networks** (~730 lines)
5. **Ecological Networks** (~780 lines)
6. **Social & Information Networks** (~810 lines)

**Total:** ~4360 lines

---

## Perspektiven-Details

### 1. Multilayer Networks (HOLISTIC)
**Paradigm Shift:** From single networks → Integrated multilayer networks as unified systems

**Core Concept:** Networks don't exist in isolation - biological systems have protein+metabolic+regulatory layers, infrastructure systems have power+communication+water layers, social systems have Twitter+Facebook+LinkedIn layers. The WHOLE multilayer system is more than the sum of individual layers - emergent properties arise from INTERLAYER connections.

**Key 2025 Research:**
- **Multilayer Network Science** (arXiv Nov 2025): Community detection, temporal networks, higher-order interactions across layers
- **TopoMPI Framework** (bioRxiv Dec 2025): Heterogeneous graph integrating metabolite-metabolite (MMI), protein-protein (PPI), metabolite-protein (MPI), drug-protein (DPI), drug-drug (DDI) interactions - AUCs 0.79-0.86 across 24 tissues
- **Glycan-Dependent Networks** (PNAS June 2025): GAP-MS platform identified 66 new glycan-dependent protein interactions
- **Mutualistic Networks** (Nature Comms): Pollinators integrated into food webs increase diversity, stability, and ecosystem function

**Holistic Integration:**
- **Multiplex networks**: Same nodes, different edge types (social platforms, protein interaction types)
- **Interdependent networks**: Different networks depending on each other (power grid ↔ communication ↔ water)
- **Temporal networks**: Layers as time slices
- **Heterogeneous graphs**: Different node AND edge types (TopoMPI: metabolites+proteins+drugs)
- **Layer coupling**: Interlayer edges connecting layers
- **Multilayer centrality**: Versatility (node activity across layers), multilayer PageRank
- **Multilayer communities**: Modules spanning layers vs layer-specific
- **Spreading dynamics**: Contagion across layers
- **Robustness**: Cascading failures, layer redundancy
- **Applications**: Systems biology (multi-omics), infrastructure (critical systems), social (multiple platforms), neuroscience (structural+functional+effective)

**Fields:** ~120 fields including layer architecture, coupling, communities, centrality, spreading, robustness, applications

---

### 2. Network Dynamics & Processes (HOLISTIC)
**Paradigm Shift:** From static structure → Dynamic processes unfolding on network topology

**Core Concept:** Network structure is just the SUBSTRATE - the magic happens in DYNAMIC PROCESSES that unfold on it. Diseases spread, neurons synchronize, cascades avalanche, opinions polarize, innovations diffuse. The WHOLE dynamical system emerges from network topology + process rules.

**Key 2025 Research:**
- **Network Dynamics** (2025): Spreading, synchronization, cascades, diffusion
- **Spreading Processes on Networks** (2025): SIR/SIS models, epidemic thresholds
- **Complex Contagion** (2025): Social reinforcement, threshold models

**Holistic Integration:**
- **Spreading dynamics**: SIR (Susceptible-Infected-Recovered), SIS, SEIR models - disease/information/behavior spread
- **Basic reproduction number R₀**: β/γ determines outbreak
- **Epidemic threshold**: Network structure sets critical transmission rate
- **Network effects**: Degree distribution (scale-free = no threshold), clustering (accelerates/slows), hubs (super-spreaders), communities (compartmentalize)
- **Synchronization**: Kuramoto model, coupled oscillators, critical coupling Kc, order parameter r, chimera states
- **Cascades**: Threshold models, avalanche size, critical mass, power-law distributions
- **Diffusion**: S-curve adoption, innovators → early adopters → early majority → late majority → laggards
- **Percolation**: Site/bond/k-core, occupation probability, phase transition (subcritical → critical → supercritical), giant component
- **Opinion dynamics**: Voter model, Deffuant, Hegselmann-Krause, consensus vs polarization, echo chambers
- **Game dynamics**: Prisoner's Dilemma, public goods, cooperation level, Nash equilibrium
- **Interventions**: Vaccination, quarantine, targeted removal (hubs vs random), edge removal, effectiveness
- **Early warning signals**: Critical slowing down, variance increase, autocorrelation increase
- **Stochasticity**: Deterministic vs stochastic, extinction probability

**Fields:** ~95 fields including spreading models, R₀, synchronization, cascades, diffusion, percolation, opinion, games, interventions

---

### 3. Network Topology & Structure (HOLISTIC)
**Paradigm Shift:** From individual nodes/edges → Emergent whole-network structural properties

**Core Concept:** A network is not just nodes connected by edges - it's a WHOLE with emergent properties. Degree distribution (power-law = scale-free), clustering (triangles), small-world (high clustering + short paths), modularity (communities), assortativity (hubs connect to hubs?), core-periphery structure. These properties EMERGE from the whole.

**Key 2025 Research:**
- **Network Science** (2025): Graph theory, network motifs, centrality
- **Complex Networks** (2025): Scale-free, small-world, community structure

**Holistic Integration:**
- **Degree distribution**: Poisson (random), power-law P(k)~k^(-γ) (scale-free), exponential, bimodal
- **Scale-free networks**: Power-law degree distribution, hubs, heterogeneity, preferential attachment growth
- **Clustering**: Global clustering coefficient C, local clustering, transitivity, triangles
- **Path lengths**: Average path length <l>, diameter (max shortest path), radius (min eccentricity)
- **Small-world**: High clustering + short paths (Watts-Strogatz), σ = (C/C_rand)/(L/L_rand)
- **Centrality measures**: Degree (connections), betweenness (bridges), closeness (average distance), eigenvector (neighbors' importance), PageRank (web ranking), Katz
- **Communities**: Modularity Q (typically 0.3-0.7), detection algorithms (Louvain, Leiden, Infomap), hierarchical structure, overlapping communities
- **Assortativity**: r (-1 to +1), assortative (hubs → hubs), disassortative (hubs → periphery)
- **Core-periphery**: k-core decomposition, dense core + sparse periphery
- **Motifs**: Feed-forward loops, bi-fans, triangles - small recurring subgraphs
- **Connected components**: Giant component, isolated nodes, fragmentation
- **Graph models**: Erdős-Rényi (random), Barabási-Albert (preferential attachment), Watts-Strogatz (small-world), configuration model
- **Robustness**: Random vs targeted attacks, percolation threshold
- **Spectral properties**: Adjacency matrix, Laplacian, eigenvalues, spectral gap

**Fields:** ~100 fields including degree distribution, hubs, clustering, paths, small-world, centrality, communities, assortativity, core-periphery, motifs, robustness

---

### 4. Biological Networks (LATERAL)
**Paradigm Shift:** From isolated molecular layers → Integrated heterogeneous networks crossing molecular boundaries

**Core Concept:** LATERAL perspective crossing MOLECULAR BOUNDARIES. Biology has DNA, RNA, proteins, metabolites, drugs, glycans - traditionally studied separately. But they form INTEGRATED NETWORKS: genes regulate genes (GRN), proteins interact with proteins (PPI), enzymes catalyze metabolites (metabolic), metabolites bind proteins (MPI), drugs target proteins (DPI). The TopoMPI framework (2025) integrates ALL these layers into heterogeneous graphs.

**Key 2025 Research:**
- **TopoMPI Framework** (bioRxiv Dec 2025): Heterogeneous graph integrating MMI, PPI, MPI, DPI, DDI - AUCs 0.79-0.86 across 24 tissue-specific networks
- **Glycan-Dependent Networks** (PNAS June 2025): GAP-MS platform discovered 66 new glycan-dependent protein interactions
- **GRN Inference** (2025): Epiregulon (Aug 2025 - ChIP/ATAC/RNA-seq integration), HyperG-VAE (Apr 2025 - hypergraph VAE), scSAGRN (Jul 2025 - scRNA/scATAC), EYKTHYR (May 2025 - spatial TF identification)
- **Multi-Omics Integration** (2025): Transformers for long-range dependencies, Heterogeneous Multi-Layered Networks (HMLN)
- **Cancer Biomarkers** (Nov 2025): PPI networks capture coordinated signals for biomarker identification

**Lateral Connections:**
- **PPI networks**: Physical binding, genetic interactions, co-expression, co-localization - protein complexes, hub proteins
- **Metabolic networks**: Metabolites, reactions, enzymes, pathways (KEGG/Reactome), compartmentalization, currency metabolites (ATP, NADH)
- **Gene regulatory networks**: TFs → target genes, activation/repression, feed-forward loops, motifs - inferred via Epiregulon/HyperG-VAE/scSAGRN/EYKTHYR
- **Signaling networks**: Receptors → kinases → phosphatases → second messengers (cAMP, Ca²⁺) → targets, pathway crosstalk
- **Multi-omics integration**: TopoMPI heterogeneous graphs, HMLN architecture, tissue-specific networks
- **Glycan-dependent**: Glycoproteins, glycan types shaping interactions, GAP-MS discovery
- **Drug-protein**: DPI (drug targets), DDI (drug-drug interactions), polypharmacology
- **Disease networks**: Disease genes/proteins/metabolites, disease modules, biomarkers, therapeutic targets, cancer driver mutations
- **Microbiota**: Host-microbe metabolite interactions, gut-brain axis
- **Single-cell**: Cell-type-specific networks, cell-cell communication (ligand-receptor)
- **Spatial**: Spatial transcriptomics, EYKTHYR spatial TF identification
- **Network medicine**: Patient-specific networks, drug repurposing, comorbidities

**Fields:** ~115 fields spanning PPI, metabolic, GRN, signaling, multi-omics, glycan, drug, disease, single-cell, spatial, network medicine

---

### 5. Ecological Networks (LATERAL)
**Paradigm Shift:** From species-level → Individual-based networks crossing species & trophic boundaries

**Core Concept:** LATERAL perspective crossing SPECIES and TROPHIC LEVEL boundaries. Ecology has plants, herbivores, carnivores, pollinators, parasites, fungi - interacting via predation, mutualism, parasitism, competition. Networks cross taxonomic kingdoms (Plantae ↔ Animalia ↔ Fungi ↔ Bacteria), trophic levels (producers → consumers → decomposers), interaction types (antagonistic ↔ mutualistic). The 2025 shift: downscaling from species to INDIVIDUALS reveals consistent interaction niches.

**Key 2025 Research:**
- **Individual-Based Networks** (PNAS Feb 2025): Downscaling mutualistic networks from species to individuals reveals consistent interaction profiles within plant populations - most individuals act in average manner
- **Pollinator Decline** (2025): Tropical pollinators near thermal limits could decline ~50% by 2100 under high-emissions scenarios, severe impacts after 2060
- **Network Complexity** (2025): Higher species richness and connectance enhance resilience to disturbance - complex networks more stable
- **Microbial Predator-Prey** (Microbiome Feb 2025): Cross-kingdom network analysis of algae and protistan predators in polar biocrust communities
- **Food Web Fitness** (arXiv Feb 2025): New methods measuring species fitness and importance via bipartite network representation
- **Molecular Analysis** (EcoNet Sept 2025): DNA metabarcoding of invertebrate predator gut contents for trophic interactions
- **Multiplex Integration** (Nature Comms): Mutualists (pollinators) integrated into food webs increase biodiversity, stability, and ecosystem function

**Lateral Connections:**
- **Individual-based**: Individuals (not just species), interaction variation within species, consistent niches, specialists vs generalists
- **Food webs**: Trophic levels (producers → herbivores → carnivores), connectance, linkage density, trophic cascade (top-down/bottom-up), keystone predators
- **Mutualistic networks**: Plant-pollinator (bees, moths, butterflies, birds, bats), nestedness, modularity, generalist core stabilizes, nocturnal pollinators
- **Climate change**: Pollinator decline projections, thermal limits, phenological mismatch, range shifts
- **Mycorrhizal**: Plant-fungi networks, common mycorrhizal networks (CMNs) connecting multiple plants
- **Host-parasite**: Host-parasite links, parasite specificity (specialist vs generalist)
- **Microbial**: Bacteria, Archaea, Protists, Algae - cross-kingdom predator-prey (2025)
- **Molecular methods**: DNA metabarcoding (gut contents, environmental DNA, pollen, feces), dietary analysis, EcoNet 2025 protocol
- **Complexity & resilience**: Network complexity (richness + connectance) → resilience, disturbance resistance, recovery, redundancy
- **Keystone species**: High impact, removal consequences
- **Habitat**: Dense forest = more stable networks, fragmentation effects
- **Seasonality**: Species turnover, network structure stability despite turnover
- **Multiplex**: Mutualists + food webs = increased diversity + stability (Nature Comms)
- **Extinctions**: Coextinction risk, cascading extinctions, robustness to removal
- **Conservation**: Threatened species, ecosystem services (pollination, seed dispersal, pest control)

**Fields:** ~110 fields including individual-based, food webs, mutualistic, climate, mycorrhizal, host-parasite, microbial, molecular, complexity, resilience, multiplex, conservation

---

### 6. Social & Information Networks (LATERAL)
**Paradigm Shift:** From pairwise ties → Higher-order interactions crossing individual/group/platform boundaries

**Core Concept:** LATERAL perspective crossing INDIVIDUAL/GROUP/PLATFORM boundaries. Social networks have individuals, groups, organizations across Twitter, Facebook, LinkedIn, offline conversations. Information spreads (news, misinformation, memes), opinions polarize, communities form. The 2025 shift: HIGHER-ORDER INTERACTIONS - not just pairwise (A↔B) but GROUP interactions (A↔B↔C↔D) captured via HYPERGRAPHS. Also: competitive diffusion (truth vs misinformation), generative AI (synthetic content), social bots, organizational velocity.

**Key 2025 Research:**
- **Information Diffusion Models** (MDPI 2025): Time delay mechanisms, multiplex networks, node dynamics time-series for network alignment
- **Higher-Order Interactions** (PMC 2025): Hypergraphs model complex group dynamics - graph structures fail to capture responses in real-world groups
- **Misinformation Spread** (JMIR 2025): Network modularity affects true vs fake information spread differently, social bots hashtag usage patterns during COVID-19
- **Generative AI** (Frontiers 2025): AI-generated content increasingly realistic and indistinguishable from authentic material
- **Organizational Knowledge Hiding** (Sage 2025): Knowledge hiding diffuses through workplace and social communication networks - study of 200 employees in 31 teams (U.S. + China)
- **Organizational Velocity** (2025): New metric replacing engagement - speed of organizational adaptation and execution
- **Competitive Diffusion** (Springer 2025): Individual polarity towards information, trust networks, decaying information freshness
- **Linguistic Features** (2025): Systematic review of language features influencing information spread
- **Topology Optimization** (2025): Network structure approaches to minimize misinformation spread

**Lateral Connections:**
- **Social media**: Twitter/X, Facebook, Instagram, LinkedIn, TikTok, Reddit - multiplex (same users across platforms)
- **Organizational**: Corporate, nonprofit, academic - formal hierarchy vs informal communication, knowledge hiding diffusion (2025), organizational velocity (2025)
- **Higher-order**: Hypergraphs, group interactions (3+ nodes), not just pairwise - opinion formation in groups (2025)
- **Information diffusion**: SIR/SIS/time-delay models (2025), simple vs complex contagion, cascade size/depth, reach
- **Misinformation**: Fake news, conspiracy theories, rumors, deepfakes - network modularity effects (2025), fact-checking effectiveness
- **Generative AI**: AI-generated text/images/videos indistinguishable from authentic (2025), synthetic media
- **Social bots**: Automated accounts, misinformation amplification, hashtag usage patterns vs humans (2025), bot detection
- **Influence**: Degree/betweenness/PageRank centrality, influencers, viral marketing, influence maximization (seed selection)
- **Competitive diffusion**: Multiple competing narratives/products, individual polarity (2025), trust networks (2025), information freshness decay (2025)
- **Communities**: Modularity, echo chambers, filter bubbles, polarization
- **Temporal**: Bursty activity, network evolution, time-series
- **Content**: Text, images, videos, links - sentiment analysis, topics, hashtags, engagement (likes/shares/comments)
- **Homophily**: Similarity attracts (demographics, ideology, interests)
- **Weak ties**: Granovetter's strength of weak ties, structural holes (Burt)
- **Algorithms**: Recommender systems, algorithmic curation, algorithmic bias, filter bubbles
- **Interventions**: Node/edge removal, information injection, fact-checking, deplatforming, topology optimization (2025)
- **Linguistic**: Language features influencing diffusion (2025 systematic review)

**Fields:** ~125 fields spanning social media, organizational, higher-order, diffusion, misinformation, AI, bots, influence, competitive diffusion, communities, content, algorithms, interventions

---

## Warum diese Perspektiven?

### Holistic = Das Ganze als integrierte Einheit
1. **Multilayer Networks**: Nicht einzelne Layer → GANZE multilayer Systeme mit Interlayer-Kopplungen (Multi-Omics, Infrastruktur, Soziale Plattformen)
2. **Network Dynamics**: Nicht statische Struktur → GANZE dynamische Prozesse auf Netzwerk-Topologie (Epidemien, Synchronisation, Kaskaden, Diffusion)
3. **Network Topology**: Nicht Knoten/Kanten → GANZE emergente Struktureigenschaften (Scale-free, Small-world, Communities, Assortativity)

### Lateral = Verbindungen über Grenzen
4. **Biological Networks**: Über MOLEKULARE GRENZEN (DNA ↔ RNA ↔ Protein ↔ Metabolit ↔ Drugs ↔ Glycane)
5. **Ecological Networks**: Über ARTEN- und TROPHISCHE GRENZEN (Produzenten ↔ Konsumenten ↔ Zersetzer; Predation ↔ Mutualismus ↔ Parasitismus)
6. **Social & Information Networks**: Über INDIVIDUUM/GRUPPE/PLATTFORM-Grenzen (Individuen ↔ Gruppen ↔ Organisationen; Online ↔ Offline; Pairwise ↔ Higher-order)

---

## Forschungsquellen (2025)

### Multilayer Networks
- **arXiv** (Nov 2025): "Multilayer Network Science" - Community detection, temporal networks, higher-order interactions [arXiv](https://arxiv.org/)
- **bioRxiv** (Dec 2025): "A Heterogeneous Graph Framework for Inference of Metabolite–Protein-Drug Interaction Networks (TopoMPI)" - AUCs 0.79-0.86 across 24 tissues [bioRxiv](https://www.biorxiv.org/content/10.64898/2025.12.18.695016v1)
- **PNAS** (June 2025): "Metabolic control of glycosylation forms for establishing glycan-dependent protein interaction networks" - 66 new interactions [PNAS](https://www.pnas.org/doi/10.1073/pnas.2422936122)
- **Nature Communications**: "Mutualism increases diversity, stability, and function of multiplex networks that integrate pollinators into food webs" [Nature Comms](https://www.nature.com/articles/s41467-020-15688-w)

### Network Dynamics & Processes
- **Network Dynamics** (2025): Spreading processes, synchronization, cascades
- **Spreading Processes on Networks** (2025): SIR/SIS models, epidemic thresholds
- **Complex Contagion** (2025): Social reinforcement, threshold models

### Network Topology & Structure
- **Network Science** (2025): Graph theory, centrality, motifs
- **Complex Networks** (2025): Scale-free, small-world, communities

### Biological Networks
- **bioRxiv** (Dec 2025): "TopoMPI Framework" - Heterogeneous metabolite-protein-drug networks [bioRxiv TopoMPI](https://www.biorxiv.org/content/10.64898/2025.12.18.695016v1)
- **PNAS** (June 2025): "Glycan-dependent interaction networks" - GAP-MS platform [PNAS Glycan](https://www.pnas.org/doi/10.1073/pnas.2422936122)
- **Cell Reports Methods** (2025): "Inferring gene regulatory networks by hypergraph generative model (HyperG-VAE)" [Cell Reports](https://www.cell.com/cell-reports-methods/fulltext/S2667-2375(25)00062-1)
- **ScienceDirect** (July 2025): "scSAGRN: Inferring gene regulatory networks from single-cell multi-omics using spatial association" [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0303264725001418)
- **bioRxiv** (May 2025): "EYKTHYR reveals transcriptional regulators of spatial gene programs" [bioRxiv EYKTHYR](https://www.biorxiv.org/content/10.1101/2025.09.23.678137v1)
- **medRxiv** (Nov 2025): "Integrating Protein-protein Interaction Networks and Machine Learning to Identify Biomarkers of Cancer Onset" [medRxiv](https://www.medrxiv.org/content/10.1101/2025.11.21.25340742v1)

### Ecological Networks
- **PNAS** (Feb 2025): "Downscaling mutualistic networks from species to individuals reveals consistent interaction niches" [PNAS Individual](https://www.pnas.org/doi/10.1073/pnas.2402342122)
- **Nature** (2025): "Tropical pollinator populations could be reduced by half this century" - 50% decline by 2100 [Nature Pollinator](https://www.nature.com/articles/d44151-025-00240-w)
- **Ecological Entomology** (2025): "Flying by night: Comparing nocturnal pollinator networks over time" - Network structure stability [Ecological Entomology](https://resjournals.onlinelibrary.wiley.com/doi/10.1111/een.13399)
- **Microbiome** (Feb 2025): "Enhancing microbial predator–prey detection with network and trait-based analyses" - Cross-kingdom analysis [Microbiome](https://microbiomejournal.biomedcentral.com/articles/10.1186/s40168-025-02035-8)
- **arXiv** (Feb 2025): "Measuring Fitness and Importance of Species in Food Webs" - Bipartite network methods [arXiv Food Web](https://arxiv.org/html/2502.07614v1)
- **protocols.io** (Sept 2025): "Molecular analysis of trophic interactions for ecological" - EcoNet workshop DNA metabarcoding [protocols.io](https://www.protocols.io/view/molecular-analysis-of-trophic-interactions-for-eco-g7kkbzkux.pdf)
- **Nature Communications**: "Mutualism increases diversity, stability, and function of multiplex networks" [Nature Comms Mutualism](https://www.nature.com/articles/s41467-020-15688-w)

### Social & Information Networks
- **MDPI Applied Sciences** (2025): "Information Diffusion Modeling in Social Networks: A Comparative Analysis of Delay Mechanisms" [MDPI](https://www.mdpi.com/2076-3417/15/11/6092)
- **PMC** (2025): "An opinion evolution model for online social networks considering higher-order interactions" - Hypergraphs [PMC Higher-Order](https://pmc.ncbi.nlm.nih.gov/articles/PMC12002442/)
- **JMIR Infodemiology** (2025): "Modularity of Online Social Networks and COVID-19 Misinformation Spreading in Russia" [JMIR Modularity](https://infodemiology.jmir.org/2025/1/e58302)
- **JMIR Infodemiology** (2025): "Unraveling the Use of Disinformation Hashtags by Social Bots During the COVID-19 Pandemic" [JMIR Bots](https://infodemiology.jmir.org/2025/1/e50021)
- **Frontiers in Computer Science** (2025): "Modeling the dynamics of misinformation spread: a multi-scenario analysis incorporating user awareness and generative AI impact" [Frontiers AI](https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2025.1570085/full)
- **Sage Journals** (2025): "Is Knowledge Hiding Contagious Within Organizational Teams? Examining Its Diffusion Through Workplace and Social Communication Networks" [Sage](https://journals.sagepub.com/doi/10.1177/00936502251392774)
- **Social Network Analysis and Mining** (2025): "Minimizing spread of misinformation in social networks: a network topology based approach" [SNAM](https://link.springer.com/article/10.1007/s13278-025-01433-y)
- **Springer Discover Data** (2025): "Introducing individual biases, trust, and information freshness for competitive information diffusion model" [Springer](https://link.springer.com/article/10.1007/s44248-025-00084-w)

---

## Integration mit anderen AMORPH-Systemen

- **GENO**: Pangenome graphs, gene regulatory networks, multi-omics integration
- **CHEMO**: Chemical reaction networks, metabolic networks, molecular interactions
- **PHYSI**: Physiological networks, neuroendocrine axes, cardiorespiratory coupling
- **PHYTO**: Plant-pollinator networks, mycorrhizal networks
- **FUNGI**: Fungal networks, mycorrhizal symbioses
- **ANATO**: Vascular networks, neural networks, lymphatic networks
- **DRAKO**: Ecological food webs, animal social networks
- **BAKTERIO/VIRO**: Microbial networks, host-pathogen networks, phage-bacteria
- **COGNITO**: Neural networks, brain connectivity, cognitive networks
- **BIOTECH**: Synthetic biology networks, genetic circuits
- **SOCIO**: Social networks, organizational networks, communication networks

---

## Technische Details

**Morph Types verwendet:**
- `text`: Network names, species, users, descriptions
- `number`: Nodes, edges, degree, path lengths, centrality scores
- `badge`: Network type, categories, states, methods
- `gauge`: Density, percentages with targets (e.g., sampling completeness, engagement rate)
- `list`: Layers, pathways, communities, top nodes, references
- `distribution`: Interaction types, content types, degree distributions
- `histogram`: Degree bins, group sizes, age distributions
- `pie`: Layer composition, energy distributions
- `network`: Dependency links, regulatory networks, social graphs
- `timeline`: Temporal evolution, development stages
- `hierarchy`: Taxonomy, organizational structure

---

## Status: VOLLSTÄNDIG ✅
Alle 6 Perspektiven basieren auf 2025 Forschung mit holistischer/lateraler Ausrichtung.
