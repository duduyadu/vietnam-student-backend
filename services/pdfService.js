const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class PDFService {
  constructor() {
    this.browser = null;
  }

  // 브라우저 인스턴스 관리
  async getBrowser() {
    try {
      if (!this.browser || !this.browser.isConnected()) {
        console.log('🌐 Launching new browser instance...');
        
        // 환경 감지
        const isWindows = process.platform === 'win32';
        const isProduction = process.env.NODE_ENV === 'production';
        
        // 기본 launch 옵션 - Puppeteer 내장 Chromium 사용
        const launchOptions = {
          headless: 'new', // Chrome의 새로운 headless 모드 사용
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--window-size=1920,1080'
          ]
        };
        
        // Production 환경 (Render 포함)에서 추가 설정
        if (isProduction) {
          console.log('🔧 Production environment detected - using Puppeteer bundled Chromium');
          
          // Render 환경을 위한 추가 args
          launchOptions.args.push('--disable-software-rasterizer');
          launchOptions.args.push('--disable-extensions');
          launchOptions.args.push('--disable-default-apps');
          launchOptions.args.push('--disable-background-timer-throttling');
          launchOptions.args.push('--disable-backgrounding-occluded-windows');
          launchOptions.args.push('--disable-renderer-backgrounding');
          launchOptions.args.push('--disable-features=TranslateUI');
          launchOptions.args.push('--disable-ipc-flooding-protection');
        }
        
        // Windows가 아닌 환경에서만 추가
        if (!isWindows) {
          launchOptions.args.push('--no-zygote');
          if (!isProduction) {
            launchOptions.args.push('--single-process');
          }
        }
        
        console.log('📋 Launch options:', {
          headless: launchOptions.headless,
          platform: process.platform,
          environment: isProduction ? 'production' : 'development'
        });
        
        this.browser = await puppeteer.launch(launchOptions);
        console.log('✅ Browser launched successfully with bundled Chromium');
      }
      return this.browser;
    } catch (error) {
      console.error('❌ Failed to launch browser:', error);
      console.error('❌ Error details:', {
        message: error.message,
        platform: process.platform,
        env: process.env.NODE_ENV
      });
      
      // 더 자세한 오류 메시지
      if (error.message.includes('Failed to launch')) {
        throw new Error('Chromium을 시작할 수 없습니다. Puppeteer 설치를 확인해주세요.');
      } else if (error.message.includes('ENOENT')) {
        throw new Error('Chromium 실행 파일을 찾을 수 없습니다. npm install을 다시 실행해주세요.');
      } else {
        throw new Error(`브라우저 시작 실패: ${error.message}`);
      }
    }
  }

  // HTML을 PDF로 변환
  async generatePDFFromHTML(htmlContent, options = {}) {
    let page = null;
    
    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();
      
      // A4 크기에 맞게 빔포트 설정
      await page.setViewport({
        width: 794,   // A4 width at 96 DPI
        height: 1123, // A4 height at 96 DPI
        deviceScaleFactor: 1
      });
      
      // 페이지 에러 핸들링
      page.on('error', msg => {
        console.error('Page error:', msg);
      });
      
      page.on('pageerror', error => {
        console.error('Page exception:', error);
      });
      
      // HTML 콘텐츠 설정
      await page.setContent(htmlContent, {
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 30000
      });
      
      // 폰트 로드 대기
      await page.evaluateHandle('document.fonts.ready');
      
      // 추가 대기 시간 (스타일 적용)
      await new Promise(r => setTimeout(r, 1000));
      
      // PDF 생성 옵션 - CSS에서 여백 제어
      const pdfOptions = {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0'
        },
        displayHeaderFooter: false,
        preferCSSPageSize: true,
        scale: 1,
        pageRanges: '', // 모든 페이지 포함
        ...options
      };
      
      console.log('📄 Generating PDF...');
      const pdfBuffer = await page.pdf(pdfOptions);
      console.log('✅ PDF generated successfully');
      
      return pdfBuffer;
      
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      throw new Error(`PDF 생성 실패: ${error.message}`);
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.error('Failed to close page:', closeError);
        }
      }
    }
  }

  // 보고서 HTML에 베트남어/한국어 지원 추가
  enhanceHTMLForPDF(htmlContent, language = 'ko') {
    // 언어별 폰트 설정
    const fontFamily = language === 'vi' 
      ? '"Noto Sans", "Arial Unicode MS", sans-serif'
      : '"Noto Sans KR", "Malgun Gothic", sans-serif';
    
    // PDF 최적화 스타일
    const additionalStyles = `
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Sans:wght@300;400;500;700&display=swap');
          
          * {
            font-family: ${fontFamily};
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html { 
            font-size: 11pt; 
          }
          
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
          
          .page {
            width: 210mm;
            height: 297mm;
            page-break-after: always;
            page-break-inside: avoid;
            position: relative;
            margin: 0;
            padding: 15mm;
            box-sizing: border-box;
          }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .page {
              margin: 0;
              border: 0;
              box-shadow: none;
            }
          }
        </style>`;
    
    // head 태그를 찾아서 스타일 추가 (대소문자 무관)
    let enhancedHTML = htmlContent;
    
    if (htmlContent.match(/<head[^>]*>/i)) {
      // head 태그가 있으면 그 안에 추가
      enhancedHTML = htmlContent.replace(
        /<head[^>]*>/i,
        (match) => match + additionalStyles
      );
    } else if (htmlContent.match(/<html[^>]*>/i)) {
      // head 태그가 없지만 html 태그가 있으면 html 태그 다음에 head 추가
      enhancedHTML = htmlContent.replace(
        /<html[^>]*>/i,
        (match) => match + '<head>' + additionalStyles + '</head>'
      );
    } else {
      // 둘 다 없으면 전체를 감싸서 추가
      enhancedHTML = `<!DOCTYPE html>
<html>
<head>${additionalStyles}</head>
<body>${htmlContent}</body>
</html>`;
    }
    
    return enhancedHTML;
  }

  // 파일로 저장
  async savePDFToFile(pdfBuffer, filePath) {
    try {
      // 디렉토리 생성
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      
      // PDF 파일 저장
      await fs.writeFile(filePath, pdfBuffer);
      
      return {
        success: true,
        filePath,
        fileSize: pdfBuffer.length
      };
    } catch (error) {
      console.error('Error saving PDF file:', error);
      throw error;
    }
  }

  // 다국어 보고서 생성
  async generateMultilingualReport(htmlContent, studentId, templateCode, language = 'ko') {
    try {
      // HTML 언어별 최적화
      const enhancedHTML = this.enhanceHTMLForPDF(htmlContent, language);
      
      // PDF 생성
      const pdfBuffer = await this.generatePDFFromHTML(enhancedHTML);
      
      // 파일명 생성
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const langSuffix = language === 'vi' ? 'VI' : 'KO';
      const fileName = `report_${studentId}_${templateCode}_${langSuffix}_${timestamp}.pdf`;
      const filePath = path.join(__dirname, '..', 'uploads', 'reports', fileName);
      
      // 파일 저장
      await this.savePDFToFile(pdfBuffer, filePath);
      
      return {
        success: true,
        fileName,
        filePath: path.join('uploads', 'reports', fileName),
        fileSize: pdfBuffer.length,
        language
      };
      
    } catch (error) {
      console.error('Error generating multilingual report:', error);
      throw error;
    }
  }

  // 브라우저 종료
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Singleton 패턴
module.exports = new PDFService();