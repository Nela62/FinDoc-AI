// import ReactDOMServer from 'react-dom/server';
// import * as htmlToImage from 'html-to-image';
// import { toPng } from 'html-to-image';

// export function generateChart() {
//   console.log('called generate chart');
//   const chart = ReactDOMServer.renderToString(<Chart />);

//   const htmlObject = document.createElement('div');
//   htmlObject.innerHTML = chart;

//   htmlToImage
//     .toPng(htmlObject)
//     .then(function (dataUrl) {
//       download(dataUrl, 'my-node.png');
//       // var img = new Image();
//       // img.src = dataUrl;
//       // console.log(dataUrl);
//       // document.body.appendChild(img);
//     })
//     .catch(function (error) {
//       console.error('oops, something went wrong!', error);
//     });
// }
