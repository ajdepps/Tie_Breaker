import { DecisionInput } from '../types';

export const PRESET_DECISIONS: { id: string; category: string; label: string; icon: string; data: DecisionInput }[] = [
  {
    id: 'career-offer',
    category: 'Career & Work',
    label: 'High-Growth Tech Startup vs Stable Corporate Role',
    icon: 'Briefcase',
    data: {
      title: 'Should I join a Series-B Startup or stay at an established Fortune 500 company?',
      context: 'I have 5 years of engineering experience. The startup offers equity with higher upside and faster growth, but longer hours. The corporate role offers top-tier 401k match, predictable 40-hour weeks, and great benefits.',
      primaryGoal: 'Accelerate career trajectory and maximize 5-year financial upside while maintaining sanity',
      timeline: 'Need to reply to offer in 5 days',
      riskTolerance: 'balanced',
      priorities: ['Career growth & learning speed', 'Total compensation & equity upside', 'Work-life balance', 'Job stability'],
      options: [
        { id: 'opt-startup', name: 'Series-B Startup Offer', description: '$165k base + $50k annual equity target, high ownership, fast pace' },
        { id: 'opt-corporate', name: 'Stay at Current Corporate Role', description: '$150k base + 15% bonus, 401k match, relaxed culture' },
        { id: 'opt-counter', name: 'Leverage Offer for Promotion at Current Company', description: 'Ask current manager to match title and bump salary to $165k' }
      ]
    }
  },
  {
    id: 'buy-vs-rent',
    category: 'Personal Finance',
    label: 'Buy a Starter Home vs Continue Renting & Investing',
    icon: 'Home',
    data: {
      title: 'Should I buy a 2-bedroom home now or continue renting and investing the down payment into index funds?',
      context: 'Current rent is $2,200/mo. Saved $90,000 for down payment. Buying would increase monthly mortgage/taxes/HOA to $3,400/mo. Mortgage interest rate is around 6.5%.',
      primaryGoal: 'Long-term wealth accumulation and lifestyle flexibility over the next 5-7 years',
      timeline: 'Current lease expires in 3 months',
      riskTolerance: 'conservative',
      priorities: ['Net worth growth', 'Cash flow peace of mind', 'Freedom to relocate', 'Pride of homeownership'],
      options: [
        { id: 'opt-buy', name: 'Buy Starter Home with 15% Down', description: 'Lock in 30yr mortgage, build home equity, pay maintenance' },
        { id: 'opt-rent', name: 'Keep Renting & Dollar-Cost Average into S&P 500', description: 'Keep living expenses lean, maximize liquid investment portfolio' }
      ]
    }
  },
  {
    id: 'tech-stack',
    category: 'Software Architecture',
    label: 'Next.js (Fullstack) vs Vite React SPA + Go Microservice',
    icon: 'Layers',
    data: {
      title: 'Which tech stack should we choose for our new B2B SaaS platform?',
      context: 'We are building a collaborative enterprise workflow tool with real-time requirements, heavy dashboarding, and auth requirements.',
      primaryGoal: 'Speed to market, maintainability for a 4-person team, and minimal operational overhead',
      timeline: 'Sprint kickoff in 2 weeks',
      riskTolerance: 'balanced',
      priorities: ['Developer velocity', 'Ecosystem maturity', 'Performance & low latency', 'Ease of hiring'],
      options: [
        { id: 'opt-nextjs', name: 'Next.js App Router (Fullstack TypeScript)', description: 'Unified codebase, server actions, Vercel/Node deployment' },
        { id: 'opt-spa-go', name: 'Vite React Client + Go Backend Service', description: 'Decoupled frontend SPA, ultra-fast Go API, Docker/K8s' }
      ]
    }
  },
  {
    id: 'relocation',
    category: 'Life & Family',
    label: 'Relocate to Coastal Hub vs Stay in Hometown',
    icon: 'MapPin',
    data: {
      title: 'Should my partner and I move to a major coastal metropolitan hub or stay near family?',
      context: 'We both work remotely. Moving offers networking, vibrant culture, and new hobbies, but costs 40% more and moves us 1,500 miles from grandparents/family.',
      primaryGoal: 'Family happiness, social fulfillment, and balanced cost of living',
      timeline: 'Next 6 months',
      riskTolerance: 'balanced',
      priorities: ['Proximity to family & support system', 'Cost of living', 'Cultural vibrancy & climate', 'Social network'],
      options: [
        { id: 'opt-move', name: 'Relocate to Coastal Hub (San Diego / Seattle)', description: 'Lease 1-year apartment, embrace city life and outdoor activities' },
        { id: 'opt-stay', name: 'Stay in Hometown Near Family', description: 'Low expenses, close family network, buy comfortable home sooner' },
        { id: 'opt-hybrid', name: 'Test-Drive: 3-Month Sublet in Target City', description: 'Spend one quarter in the new city before committing to a permanent move' }
      ]
    }
  },
  {
    id: 'startup-funding',
    category: 'Business & Ventures',
    label: 'Bootstrap to Profitability vs Raise Seed Venture Capital',
    icon: 'Rocket',
    data: {
      title: 'Should we bootstrap our AI productivity SaaS or raise a $1.5M Seed round?',
      context: 'Currently generating $8,000 MRR growing 20% MoM with 2 co-founders. Angels and seed funds are showing inbound interest for a $1.5M round at $8M valuation.',
      primaryGoal: 'Build a durable, high-value software company while retaining ownership and control',
      timeline: 'Decide in next 30 days',
      riskTolerance: 'aggressive',
      priorities: ['Founder equity ownership', 'Speed of capturing market share', 'Runway & hiring power', 'Stress & investor pressure'],
      options: [
        { id: 'opt-bootstrap', name: 'Bootstrap & Reinvest Organic Revenue', description: '100% founder ownership, sustainable growth, no board oversight' },
        { id: 'opt-raise', name: 'Raise $1.5M Seed Round', description: 'Hire 3 senior engineers immediately, accelerate GTM, 18% dilution' }
      ]
    }
  }
];
