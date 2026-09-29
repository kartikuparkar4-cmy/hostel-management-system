# 🎥 Hostel Tour Video Integration Guide

## Current Setup

Your landing page now features a professional **Hosteller** hostel tour video that automatically plays when users click the **Play** button in the amenities section.

### Video Details
- **Current Video**: Real Hosteller hostel tour and advertisement
- **YouTube ID**: `9No-FiEInLA`
- **Features**: 
  - Autoplay when modal opens
  - Responsive video player
  - Full-screen support
  - Clean modal design with dark overlay

---

## 🔄 How to Replace with Your Own Video

### Option 1: Use Your YouTube Video (Recommended)

1. **Upload your hostel tour video to YouTube**
   - Film a tour of your hostel facilities
   - Include: rooms, common areas, study spaces, amenities
   - Keep it 2-5 minutes for best engagement

2. **Get the Video ID**
   - Open your video on YouTube
   - Look at the URL: `https://www.youtube.com/watch?v=YOUR_VIDEO_ID`
   - Copy the part after `v=`

3. **Update the code** in `src/components/HostellerLanding.tsx`

Find line **~600** (in the video modal section) and replace:

```tsx
// Change this line:
src="https://www.youtube.com/embed/9No-FiEInLA?autoplay=1&rel=0"

// To:
src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1&rel=0"
```

**YouTube URL Parameters Explained:**
- `autoplay=1` - Starts playing when modal opens
- `rel=0` - Shows only videos from your channel (less distraction)
- `&mute=1` - Add this to start muted (good for some sites)

---

### Option 2: Use Vimeo Video

If you prefer Vimeo:

1. Upload video to Vimeo
2. Get the video ID from URL: `https://vimeo.com/YOUR_VIDEO_ID`
3. Replace the iframe:

```tsx
<iframe
  className="w-full h-full"
  src="https://player.vimeo.com/video/YOUR_VIDEO_ID?autoplay=1&title=0&byline=0&portrait=0"
  title="Hosteller Campus Tour"
  frameBorder="0"
  allow="autoplay; fullscreen; picture-in-picture"
  allowFullScreen
></iframe>
```

---

### Option 3: Host Your Own Video File

For videos hosted on your server:

1. Place video file in `public/videos/` folder:
   - Create folder if it doesn't exist
   - Name it: `hostel-tour.mp4` (or `.webm`)

2. Replace iframe with video tag:

```tsx
<video 
  className="w-full h-full" 
  controls 
  autoPlay
  poster="/hostel-tour-thumbnail.jpg"
>
  <source src="/videos/hostel-tour.mp4" type="video/mp4" />
  <source src="/videos/hostel-tour.webm" type="video/webm" />
  Your browser does not support the video tag.
</video>
```

**Pros**: Complete control, no external dependencies  
**Cons**: Larger file sizes, need to host it, bandwidth costs

---

## 🎬 Video Production Tips

### What to Include in Your Hostel Tour

1. **Exterior Shot** (5-10 seconds)
   - Building facade
   - Campus location
   - Surrounding area

2. **Reception/Lobby** (10-15 seconds)
   - Check-in desk
   - Seating area
   - Welcome vibe

3. **Common Areas** (20-30 seconds)
   - Study lounges
   - Recreation room
   - Kitchen/dining area
   - TV lounge

4. **Bedroom Showcase** (30-40 seconds)
   - Different room types (single, double, dorm)
   - Bed quality
   - Study desk
   - Storage lockers
   - Natural lighting

5. **Bathroom Facilities** (10-15 seconds)
   - Clean, modern look
   - Shower area
   - Privacy features

6. **Amenities** (20-30 seconds)
   - WiFi demonstration
   - Security features
   - Laundry room
   - Parking
   - Outdoor spaces

7. **Student Testimonials** (15-20 seconds)
   - Quick sound bites from happy residents
   - Diverse perspectives

8. **Call to Action** (5-10 seconds)
   - Contact information
   - Website URL
   - "Book Now" message

### Technical Specs

- **Resolution**: 1080p minimum (1920x1080)
- **Aspect Ratio**: 16:9 (standard YouTube)
- **Length**: 2-5 minutes ideal
- **Format**: MP4 (H.264 codec)
- **Audio**: Clear voiceover or background music
- **Subtitles**: Add captions for accessibility

### Filming Tips

✅ **Do:**
- Use steady shots (tripod/gimbal)
- Good lighting (natural light or soft lamps)
- Clean, tidy spaces before filming
- Show real students (with permission)
- Keep camera moving smoothly
- Add upbeat background music

❌ **Don't:**
- Shaky handheld footage
- Dark, poorly lit shots
- Messy/cluttered rooms
- Long static shots
- Boring narration
- Copyright music

---

## 🎨 Customize Modal Design

### Change Modal Title

Line **~577** in `HostellerLanding.tsx`:

```tsx
<h3 className="text-lg font-bold text-slate-900 dark:text-white">
  🏠 Your Custom Title Here
</h3>
```

### Change Description Text

Line **~590**:

```tsx
<p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
  Your custom description about the video...
</p>
```

### Add Custom Styling

The modal uses Tailwind CSS classes. Customize colors:

```tsx
// Dark overlay
className="fixed inset-0 z-50 bg-black/90"

// Modal background (change bg-white to your color)
className="bg-white dark:bg-slate-900 rounded-xl"

// Adjust max width
className="max-w-4xl w-full"  // Change to max-w-6xl for larger
```

---

## 📊 Video Analytics

### Track Video Views (YouTube)

If using YouTube:
1. Go to YouTube Studio
2. Click "Analytics" 
3. See views, watch time, engagement
4. Track where viewers drop off

### Add Google Analytics Event

Track when users open the video modal:

```tsx
onClick={() => {
  setShowVideoModal(true);
  // Google Analytics event
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'video_play', {
      'event_category': 'engagement',
      'event_label': 'hostel_tour_video'
    });
  }
}}
```

---

## 🚀 Testing Your Video

1. **Local Testing**
   ```bash
   npm run dev
   ```
   - Visit http://localhost:3000
   - Scroll to "We have everything you need" section
   - Click the Play button
   - Verify video loads and plays

2. **Check Responsiveness**
   - Test on mobile (Chrome DevTools)
   - Test on tablet
   - Test on desktop
   - Ensure video is always 16:9 ratio

3. **Test Autoplay**
   - Click Play button
   - Video should start immediately
   - Audio should play (or respect mute setting)

4. **Test Modal Close**
   - Click X button → should close
   - Click outside modal → should close
   - Press ESC key → should close (if implemented)

---

## 🎯 Alternative Video Sources

### Free Stock Videos

If you don't have your own footage:

1. **Pexels Videos** - https://www.pexels.com/videos/
   - Search: "hostel", "student accommodation", "dorm room"
   - Free, no attribution required

2. **Pixabay** - https://pixabay.com/videos/
   - Similar free stock footage
   - Download MP4 files

3. **Unsplash Videos** - https://unsplash.com/videos
   - High-quality clips
   - Free for commercial use

### Professional Video Services

For professional production:

1. **Fiverr** - Starting at $50-200
2. **Upwork** - Professional videographers
3. **Local film students** - Often affordable
4. **Real estate videographers** - They do property tours

---

## 📝 Current Video Features

✅ Autoplay when modal opens  
✅ Responsive design (mobile, tablet, desktop)  
✅ Full-screen support  
✅ Dark overlay with close button  
✅ Prevents related videos from other channels  
✅ Works with YouTube, Vimeo, or local files  
✅ Smooth animations and transitions  
✅ Accessible (keyboard navigation, ARIA labels)  
✅ Dark mode compatible  

---

## 🆘 Troubleshooting

### Video Won't Play
- Check internet connection
- Verify video ID is correct
- Try in incognito mode (clear cache)
- Check browser console for errors

### Autoplay Blocked
- Some browsers block autoplay with sound
- Solution: Add `&mute=1` to YouTube URL
- Or remove `autoplay=1` parameter

### Video Shows Related Videos
- Add `&rel=0` parameter to YouTube URL
- Note: YouTube may still show related videos after video ends

### Modal Won't Close
- Check if `onClick` handlers are working
- Verify `setShowVideoModal(false)` is called
- Check z-index conflicts

---

## 📞 Need Help?

If you need assistance:
1. Check browser console for errors
2. Verify video URL is accessible
3. Test in different browsers
4. Check network tab for failed requests

---

**Last Updated**: September 29, 2026  
**Video**: Real Hosteller hostel tour (placeholder - replace with your own)  
**Status**: ✅ Working and integrated
