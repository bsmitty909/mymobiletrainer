# YouTube Video Integration

## Overview
The app now uses workout demonstration videos from the **30 Minute Body** YouTube channel (@30minutebody80) for all exercise references.

## Channel Information
- **Channel**: @30minutebody80
- **URL**: https://www.youtube.com/@30minutebody80/videos
- **Videos**: 36 workout demonstration videos

## Integrated Videos

### Chest Exercises
- **Bench Press**: https://www.youtube.com/watch?v=VKpW25ffj7Y
- **Dumbbell Incline Press**: https://www.youtube.com/watch?v=WgviBZvfoFo
- **Machine Chest Press**: https://www.youtube.com/watch?v=NozX8gJICPs
- **Dumbbell Chest Fly**: https://www.youtube.com/watch?v=8mC6rd_j5Lc
- **Machine Chest Flys**: https://www.youtube.com/watch?v=i_BPwrtCSxA

### Back Exercises
- **Lat Pull Down**: https://www.youtube.com/watch?v=H_hYC__3few
- **Machine Low Row**: https://www.youtube.com/watch?v=4qLaWS8UHyU
- **Machine High Row**: https://www.youtube.com/watch?v=pIp9Ty1QSQ0
- **Dumbbell High Row**: https://www.youtube.com/watch?v=jxLcD5gXsEY
- **Cable High Pulley Row**: https://www.youtube.com/watch?v=eQQBc1GTZlg

### Leg Exercises
- **Leg Press**: https://www.youtube.com/watch?v=lSpyBhPPxVo
- **Leg Extension**: https://www.youtube.com/watch?v=YfFyB5rGQiU
- **Leg Curl**: https://www.youtube.com/watch?v=r5H9_HGoc-Y
- **Prone Leg Curl**: https://www.youtube.com/watch?v=Sw_SASZmsMA
- **Assisted Squats**: https://www.youtube.com/watch?v=6iGb_erMfQE
- **Machine Squat**: https://www.youtube.com/watch?v=IE1KDiZ4GjA

### Shoulder Exercises
- **Dumbbell Shoulder Press**: https://www.youtube.com/watch?v=SN82rlAJcdw
- **Machine Shoulder Press**: https://www.youtube.com/watch?v=JBlYTdHZgxE
- **Dumbbell Side Lateral Raises**: https://www.youtube.com/watch?v=6EzcpFk0X5g
- **Dumbbell Rear Delt Fly**: https://www.youtube.com/watch?v=gZl1zWubsEM
- **Machine Rear Delt Flys**: https://www.youtube.com/watch?v=oHkAEXuzmWk
- **Shoulder Cleans**: https://www.youtube.com/watch?v=oq37dtY_J0Y

### Arm Exercises (Biceps)
- **Bicep Cable Curls**: https://www.youtube.com/watch?v=Jxw_cgFxg4c
- **Alternating Dumbbell Curls**: https://www.youtube.com/watch?v=T5-8RDT_RPQ
- **Bar Bell Curls**: https://www.youtube.com/watch?v=Btul5KxtPH0

### Arm Exercises (Triceps)
- **Tricep Push Downs (Straight Bar)**: https://www.youtube.com/watch?v=9mmWJyYfkkc
- **Tricep Push Downs (Rope)**: https://www.youtube.com/watch?v=-oeqDeylT3M
- **Dumbbell Tricep Extensions**: https://www.youtube.com/watch?v=NjPjzoyUbhA
- **Overhead Tricep Extensions**: https://www.youtube.com/watch?v=UXjrXxjgA5o

## Implementation Details

### Files Modified
- [`app/src/constants/exercises.ts`](app/src/constants/exercises.ts) - Updated all exercise video URLs to point to @30minutebody80 channel

### How Videos Are Used
1. Each exercise in the exercise library has a `videoUrl` property
2. Users can tap the video icon during workouts to view exercise demonstrations
3. The [`VideoPlayerModal`](app/src/components/workout/VideoPlayerModal.tsx) component opens videos in the device's default browser
4. Videos provide proper form and technique guidance for each exercise

### Video Access
- Videos open in external browser (YouTube app or mobile browser)
- No embedded player to avoid dependency conflicts
- Direct links ensure videos are always available when device has internet connection

## Benefits
1. **Consistent Source**: All workout videos from a single, dedicated fitness channel
2. **Professional Quality**: High-quality demonstrations with proper form
3. **Complete Coverage**: Videos available for all exercises in the workout program
4. **Always Updated**: Videos hosted on YouTube, so no app updates needed if channel adds new content

## Future Enhancements
- Consider adding playlist support for complete workout routines
- Add offline video caching for users with limited connectivity
- Implement in-app video player if WebView dependencies are resolved
- Add video bookmarking for frequently referenced exercises
