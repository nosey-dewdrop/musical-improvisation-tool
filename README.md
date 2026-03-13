# musical-improvisation-tool
<u>*scale identifier. show which scales is possible depending on few notes. so you can enhance your solo plays on piano or guitar.*</u>

### live: https://nosey-dewdrop.github.io/musical-improvisation-tool/

## 🎸🎹 what is this?
a program to **identify musical scales** based on a few notes you play or hear. it helps you improvise fluently on **piano, guitar, or any melodic instrument** by quickly suggesting compatible scales and chords.

### one of my biggest joy is listening through my playlists and harmonize together with random songs. this program helps you to identify the key when you are playing with a random song.

for instance, *Sails of Charon by Scorpions* starts with:

1. C D E F# G A B C
2. C# D E F# G A B C#

***then, it continues with C.***

confirming option (1): **B Phrygian**.

now, you can play it really fast without trying to guess the notes and the scale within listening. moreover, you know all the triad chords. if you do not, you can build up any chords you want to.

## 🎶🎹 features

- **scale detector** — pick notes from piano or guitar, find matching scales instantly
- **7 modes** — ionian, dorian, phrygian, lydian, mixolydian, aeolian, locrian
- **diatonic chords** — triads, 7th chords, sus chords for each scale degree
- **chord progression planner** — build, save, load progressions with localStorage
- **common progressions** — pop classic, jazz ii-V-I, blues, andalusian and more
- **interactive piano** — 1/2/3 octaves, correct frequencies per octave, keyboard shortcuts (QWERTY)
- **interactive guitar fretboard** — 6 strings, 12 frets, correct octave per string
- **note sounds** — piano gets sine wave, guitar gets triangle wave with harmonics
- **song suggestions** — songs per key with Spotify embed, plays right in the page
- **Spotify playlist embed** — damla radio built into the header
- **music theory & philosophy page** — essays about why music matters
- **dark mode** — full dark theme toggle
- **Y2K aesthetic** — 2000s internet window style with Klimt's Bauerngarten as background

## 🛠 technologies

| what | how |
|------|-----|
| **frontend** | vanilla HTML, CSS, JavaScript — no frameworks, no dependencies |
| **audio** | Web Audio API (OscillatorNode, GainNode) — sine wave for piano, triangle + harmonics for guitar |
| **music embeds** | Spotify oEmbed iframe API |
| **persistence** | localStorage for saved notes, selected key/mode, octave preference, chord progressions |
| **fonts** | Google Fonts — Quicksand |
| **layout** | CSS Grid + Flexbox, responsive with mobile breakpoints |
| **hosting** | GitHub Pages |
| **background** | Klimt's Bauerngarten (bg.png) |

## 🎵 how it works

1. pick some notes you hear from the piano or guitar
2. the algorithm finds all 12 major scales that contain your notes (pitch-based comparison, so enharmonics like D# and Eb match)
3. pick a key, explore modes, see diatonic chords
4. build chord progressions, save them, try common ones
5. see song suggestions for that key, play them with Spotify right there

## for musicians or anyone who is willing to compose.

### 🎧 happy improvising!

# take a look at my documents to read about music, theory, etc