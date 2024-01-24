import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // @ts-ignore
const pdfMake: any = require('pdfmake/build/pdfmake');
// @ts-ignore
const pdfFonts: any = require('pdfmake/build/vfs_fonts');
  title = 'recipe-frontend';
  showProgressBar = false;

  previewImage: string | null  = null;
  selectedFile: File | null = null;
  extractedText: string | null = null;
  errorMessage: string | null = null;

  constructor(private http: HttpClient,private clipboard: Clipboard, private snackBar: MatSnackBar) { }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    // Display preview image
    this.previewImage = this.selectedFile ? URL.createObjectURL(this.selectedFile) : null;
  }

  uploadImage() {
    this.showProgressBar = true;

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('image', this.selectedFile);
  
      // Change the URL to your actual server endpoint for handling file uploads
      this.http.post<any>('http://127.0.0.1:5000/create_recipe', formData)
        .subscribe(
          response => {
            console.log('inside response');
            console.log(response.text);
  
            // Assuming the response is an object with a 'text' property
            this.extractedText = response.text;
            console.log(this.extractedText)
            // Reset the selected file and preview
            this.selectedFile = null;
            // this.previewImage = null;
            this.showProgressBar = false;

          },
          error => {
            this.errorMessage = 'Error uploading image. Please try again.';
            this.showProgressBar = false;

          }
        );
    } else {
      this.errorMessage = 'Please select an image file.';
    }
  }
  
  copyToClipboard() {
    if (this.extractedText) {
      this.clipboard.copy(this.extractedText);
      this.snackBar.open('Text copied to clipboard', 'Dismiss', {
        duration: 2000,
      });
    }
  }


  downloadPDF = () => {
  // Check if the extractedText is available
  if (this.extractedText) {
    // Define the document definition for pdfMake
    const docDefinition:any = {
      content: [
        { text: 'Recipe:', style: 'header' },
        { text: this.extractedText, style: 'paragraph' },
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        paragraph: {
          fontSize: 16,
          margin: [0, 0, 0, 10],
        },
      },
    };

    // Create and download the PDF
    pdfMake.createPdf(docDefinition).download('converted_text.pdf');
  } else {
    console.error('Converted text is not available.');
  }
};
    
}
