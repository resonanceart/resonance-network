import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      artistName,
      artistBio,
      artistEmail,
      artistWebsite,
      projectTitle,
      oneSentence,
      vision,
      experience,
      story,
      goals,
      domains,
      pathways,
      stage,
      scale,
      location,
      materials,
      specialNeeds,
      heroImageData,
      galleryImagesData,
    } = body

    if (!artistName || !artistEmail || !projectTitle) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and project title are required.' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('project_submissions')
      .insert({
        artist_name: artistName,
        artist_bio: artistBio || null,
        artist_email: artistEmail,
        artist_website: artistWebsite || null,
        project_title: projectTitle,
        one_sentence: oneSentence || null,
        vision: vision || null,
        experience: experience || null,
        story: story || null,
        goals: goals || null,
        domains: domains || null,
        pathways: pathways || null,
        stage: stage || null,
        scale: scale || null,
        location: location || null,
        materials: materials || null,
        special_needs: specialNeeds || null,
        hero_image_data: heroImageData || null,
        gallery_images_data: galleryImagesData || null,
        status: 'new',
      })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to save submission. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Submission received successfully.' })
  } catch (err) {
    console.error('Submit project error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}
