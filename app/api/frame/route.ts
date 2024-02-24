import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { NEXT_PUBLIC_URL } from '../../config';

const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY || '');

async function getRandomUser(): Promise<string> {
  // Implement logic to fetch a random user's Ethereum address
  const userAddresses = [
    '0x55A5705453Ee82c742274154136Fce8149597058',
    '0x2423e325Bf785096516D88355A5E3854f9d59D1A',
    '0xBEeC75A2025B34767cB60F0bea5C4c8BE489bA6D',
    '0xeCa8AfaE2a2C3862B68e7f970CBF6a56B55ED7bB',
    '0xe978bDBC3347feB6ED10c9845BBDc298604F80ca',
  ];
  const randomIndex = Math.floor(Math.random() * userAddresses.length);
  return userAddresses[randomIndex];
}
async function getUserProfile(ethereumAddress: string): Promise<any> {
  try {
    const user = await neynarClient.lookupUserByVerification(ethereumAddress);
    return user.result.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string = '';
  let text: string = '';

  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (isValid) {
    accountAddress = message.interactor.verified_accounts[0];
  }

  if (message?.input) {
    text = message.input;
  }

  if (message?.button === 3) {
    return NextResponse.redirect(
      'https://www.google.com/search?q=cute+dog+pictures&tbm=isch&source=lnms',
      { status: 302 },
    );
  }

  // Fetch a random user's Ethereum address
  const randomUserAddress = await getRandomUser();

  // Fetch the user's profile based on the Ethereum address
  const userProfile = await getUserProfile(randomUserAddress);

  if (userProfile) {
    // Display the user's PFP and implement your rating system
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: `Hot or Not? 🔥👀`,
          },
        ],
        image: {
          src: userProfile.pfp[0].url, // Assuming the PFP is an array and you want the first one
        },
        postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
      }),
    );
  }

  // Handle the case when fetching user profile fails
  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `Error fetching user profile. Try again.`,
        },
      ],
      image: {
        src: 'http://ipfs.io/ipfs/QmY9QDro1mvLDrEuxX6vVEPangxsfajcJRti2LSwpYtdgm', // Placeholder image URL
      },
      postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
