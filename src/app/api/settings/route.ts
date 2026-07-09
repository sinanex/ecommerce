import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    let settings = await (Settings as any).findOne();
    if (!settings) {
      settings = await (Settings as any).create({});
    }

    // Do not return adminPassword to the client in GET
    const settingsData = settings.toObject();
    delete settingsData.adminPassword;

    return NextResponse.json(settingsData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    verifyAuth(req); // Ensure only logged-in admin can change settings

    const body = await req.json();
    let settings = await (Settings as any).findOne();

    if (!settings) {
      settings = await (Settings as any).create(body);
    } else {
      // Only update provided fields
      const updatableFields = [
        'processingTimeFrom',
        'processingTimeTo',
        'deliveryTimeFrom',
        'deliveryTimeTo',
        'codDeliveryAmount',
        'adminUsername',
        'adminPassword',
        'salesTags'
      ];

      updatableFields.forEach(field => {
        if (body[field] !== undefined) {
          // Do not overwrite adminPassword with an empty string
          if (field === 'adminPassword' && body[field] === '') {
            return;
          }
          settings[field] = body[field];
        }
      });

      await settings.save();
    }

    return NextResponse.json({ message: 'Settings updated successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
