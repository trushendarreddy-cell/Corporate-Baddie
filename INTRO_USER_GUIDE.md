# CorporateBaddie Intro Experience - User Guide

## Quick Start

The intro experience automatically shows when you first visit CorporateBaddie. It provides an interactive visualization of the decision intelligence system.

## What You See

### The Central Sphere

The large sphere at the center represents the CorporateBaddie decision engine. It contains:
- Internal data structure (vertical bars)
- Translucent analytical layers
- Wireframe geometry
- Slow ambient rotation

This is NOT decorative - it represents the multi-layered analytical system that processes your business questions.

### Five Intelligence Nodes

Five nodes orbit the central sphere, each representing a key dimension of decision intelligence:

1. **DATA** (neutral gray)
   - Your business data
   - Internal records and analytics
   
2. **MARKET** (neutral gray)
   - What's happening outside
   - External market conditions
   
3. **EVIDENCE** (sage green)
   - What supports the decision
   - Claims, calculations, sources
   
4. **RISK** (muted terracotta)
   - What could go wrong
   - Uncertainty and downside
   
5. **DECISION** (sage green)
   - What we should do
   - Recommended action

### Orbital Rings

Three thin rings show the different orbital paths of the intelligence streams. They represent the continuous flow of information through the system.

## How to Interact

### Explore Nodes

**Hover** over any orbiting node:
- Node scales up and brightens
- Connection line becomes more visible
- Detail panel appears on the right (desktop)
- Cursor changes to pointer

**Click** on any node:
- Selects the node
- Shows full description
- Node stays highlighted
- Click elsewhere or press Escape to deselect

### Move the View

**Mouse Movement**:
- The entire scene responds to your cursor position
- Creates subtle parallax effect
- Gives depth perception

**Touch (Mobile)**:
- Touch and drag to rotate the view
- Pinch to zoom (if enabled)
- Tap nodes to select them

### Enter the Application

When you're ready, click the large button:

**"ENTER DECISION INTELLIGENCE ↗"**

This triggers a cinematic transition:
1. Nodes accelerate toward the sphere
2. Orbital rings tighten and fade
3. Sphere compresses then expands
4. Scene fades to the main workspace

Duration: ~1.2 seconds

### Skip the Intro

If you want to bypass the intro entirely:

Click **"SKIP INTRO →"** in the top-right corner

This provides a quick fade (300ms) directly to the main application.

## Layout Guide

### Desktop Layout

```
┌─────────────────────────────────────────────────────────┐
│ ● CORPORATEBADDIE | INTRO    DECISION INTEL / 01  SKIP→ │
│                                                           │
│  MAKING SENSE OF CORPORATE NONSENSE.                     │
│                                                           │
│  Turn business questions into                     [NODE  │
│  evidence-backed decisions.                       DETAIL]│
│                                          [SPHERE]         │
│  It investigates your data...                            │
│                                                           │
│  EXAMPLE QUESTION                                        │
│  "Why are our margins falling?" →                        │
│                                                           │
│  [ENTER DECISION INTELLIGENCE ↗]                         │
│                                                           │
│  INTELLIGENCE SYSTEM   01 DATA   02 ANALYSIS...          │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout

```
┌──────────────────────┐
│ ● CORPORATEBADDIE    │
│           SKIP INTRO→│
│                      │
│ MAKING SENSE OF...   │
│                      │
│ Turn business        │
│ questions into       │
│ evidence-backed      │
│ decisions.           │
│                      │
│     [SPHERE]         │
│                      │
│ EXAMPLE QUESTION     │
│ "Why are our..."     │
│                      │
│ [ENTER DECISION...]  │
│                      │
│ INTELLIGENCE SYSTEM  │
└──────────────────────┘
```

## Keyboard Controls

- **Tab**: Navigate between interactive elements
- **Enter**: Activate focused button
- **Escape**: Clear node selection
- **Space**: Activate focused button

## Accessibility Features

### Reduced Motion

If you have motion sensitivity or have enabled "Reduce Motion" in your system preferences, the intro automatically:

- Disables orbital animation
- Disables sphere rotation
- Uses a simple fade transition instead of convergence
- Keeps all interactive features working

### Screen Readers

The intro provides:
- Descriptive ARIA labels
- Semantic HTML structure
- Keyboard-accessible controls
- Clear focus indicators

### Keyboard-Only Navigation

You can navigate the entire intro using only keyboard:
1. Tab to "SKIP INTRO" or "ENTER DECISION INTELLIGENCE"
2. Press Enter to activate
3. Tab to example question (if implemented as button)

## Example Question

The bordered field showing:

**"Why are our margins falling?" →**

This is an example to illustrate the type of question you can ask CorporateBaddie. It's NOT actual data from your company.

In the main application, you'll be able to:
- Enter your own questions
- Upload your own data
- Get evidence-backed recommendations

## Bottom Intelligence System

The bottom bar shows the six phases of investigation:

1. **DATA** - Gathering business information
2. **ANALYSIS** - Understanding the numbers
3. **MARKET** - External research
4. **EVIDENCE** - Building claims
5. **RISK** - Assessing uncertainty
6. **DECISION** - Forming recommendation

This gives you a preview of what happens when you run an investigation.

## Tagline

**"EVIDENCE OVER ELOQUENCE."**

This appears in the bottom-right and captures the CorporateBaddie philosophy: decisions should be based on evidence, not just persuasive arguments.

## Replay the Intro

If you want to see the intro again after entering the application:

**Method 1: Browser DevTools**
1. Open DevTools (F12)
2. Go to Console
3. Type: `sessionStorage.removeItem('corporatebaddie:intro-completed')`
4. Press Enter
5. Refresh the page

**Method 2: Clear Browser Data**
1. Clear site data for localhost:3000
2. Refresh the page

## Technical Notes

### System Requirements

- **Browser**: Modern browser with WebGL support
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+

- **Hardware**: 
  - Dedicated GPU recommended
  - 4GB RAM minimum
  - Modern CPU (2015+)

### Performance

The intro is optimized for:
- 60fps on modern hardware
- 30fps on older devices
- Automatic quality reduction on mobile
- Pauses when tab is inactive

### Mobile Devices

Works on:
- iPhone (iOS 14+)
- iPad (iOS 14+)
- Android phones (Chrome 90+)
- Android tablets (Chrome 90+)

May have reduced visual quality on older devices to maintain smooth performance.

## Troubleshooting

### Intro Doesn't Load

**Check:**
- WebGL is enabled in browser
- JavaScript is enabled
- Browser is up to date
- No ad blockers interfering

### Poor Performance

**Try:**
- Close other browser tabs
- Close other applications
- Update graphics drivers
- Use a different browser

### Nodes Not Responding

**Check:**
- Mouse/touch events are working
- No browser extensions blocking
- Canvas is fully loaded (wait 2-3 seconds)

### Animation Stutters

**Common causes:**
- Other tabs using resources
- Background applications
- Older hardware
- Enable reduced motion (system preferences)

## What Happens Next

After clicking "ENTER DECISION INTELLIGENCE", you'll arrive at the main CorporateBaddie workspace:

- **Investigate Module**: Ask business questions
- **Data Sources**: Connect your business data
- **Evidence Engine**: See how conclusions are reached
- **Risk Assessment**: Understand uncertainty
- **Decision Room**: Compare strategic options

The intro gives you a visual preview of this analytical system. Each orbiting node corresponds to a workspace module you can explore.

## Design Philosophy

The intro experience is designed to communicate:

1. **Analytical Rigor**: Not flashy, but engineered
2. **Multi-dimensional**: Evidence comes from many streams
3. **Interconnected**: Data, market, evidence, risk, decision all relate
4. **Continuous**: The orbital motion represents ongoing intelligence gathering
5. **Elegant**: Sophisticated without being overwhelming

This is NOT a typical AI dashboard. It's a decision intelligence system that shows you WHY recommendations can be trusted.

## Questions?

Once you enter the main application, you can:
- Click the **Help** icon in the header
- Read the "How It Works" documentation
- Explore the Settings panel
- Start with the example questions

---

**Ready to get started?**

Click **"ENTER DECISION INTELLIGENCE ↗"** to begin.
