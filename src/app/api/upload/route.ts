import { PDFiumLibrary } from '@hyzyla/pdfium';
import { promises as fs } from 'fs'; // To save the file temporarily
import { NextRequest, NextResponse } from 'next/server'; // To handle the request and response
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  const formData: FormData = await req.formData();
  const uploadedFiles = await formData.getAll('filepond');
  const uploadedFile = await uploadedFiles[1];
  // @ts-ignore
  const fileBuffer = await Buffer.from(await uploadedFile.arrayBuffer());
  await fs.writeFile("test.pdf", fileBuffer);

  const library = await PDFiumLibrary.init();
  const buff = await fs.readFile("test.pdf");
  const document = await library.loadDocument(buff);
  const page = await document.getPage(0);
  const image = await page.render({
    scale: 3,
    render: async (options: any): Promise<Uint8Array> => {
      return await sharp(options.data, {
        raw: {
          width: options.width,
          height: options.height,
          channels: 4,
        },
      })
        .png()
        .toBuffer();
    },
  });

  await fs.writeFile("test.png", Buffer.from(image.data));

  return new NextResponse(null, { status: 500 });
}