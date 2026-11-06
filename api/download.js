const {deflateRawSync}=require('node:zlib');
function zipFile(name,data){
 let crc=0xffffffff;for(const b of data){crc^=b;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}crc=(crc^0xffffffff)>>>0;
 const n=Buffer.from(name),z=deflateRawSync(data),l=Buffer.alloc(30),c=Buffer.alloc(46),e=Buffer.alloc(22);
 l.writeUInt32LE(0x04034b50,0);l.writeUInt16LE(20,4);l.writeUInt16LE(0x800,6);l.writeUInt16LE(8,8);l.writeUInt32LE(crc,14);l.writeUInt32LE(z.length,18);l.writeUInt32LE(data.length,22);l.writeUInt16LE(n.length,26);
 c.writeUInt32LE(0x02014b50,0);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(8,10);c.writeUInt32LE(crc,16);c.writeUInt32LE(z.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(n.length,28);
 const central=Buffer.concat([c,n]);e.writeUInt32LE(0x06054b50,0);e.writeUInt16LE(1,8);e.writeUInt16LE(1,10);e.writeUInt32LE(central.length,12);e.writeUInt32LE(l.length+n.length+z.length,16);
 return Buffer.concat([l,n,z,central,e]);
}
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).send('POST required');}
 try{
 let body=req.body;if(typeof body==='string')body=Object.fromEntries(new URLSearchParams(body));
 const html=body&&body.html;if(typeof html!=='string'||!/^<!doctype html>/i.test(html))return res.status(400).send('Invalid letter');
 if(Buffer.byteLength(html)>1500000)return res.status(413).send('Letter is too large');
 const name=String(body.filename||'예수묵상편지.html').replace(/[\\/\r\n"<>:|?*]/g,'_').slice(0,160).replace(/\.html$/i,'')+'.html';
 const zipped=body.format==='zip',filename=zipped?name.replace(/\.html$/,'.zip'):name;
 const data=Buffer.from(html,'utf8');const output=zipped?zipFile(name,data):data;
 res.setHeader('Content-Type',zipped?'application/zip':'text/html; charset=utf-8');
 res.setHeader('Content-Disposition',`attachment; filename="jesus-meditation-letter.${zipped?'zip':'html'}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
 res.setHeader('Content-Security-Policy',"sandbox");
 return res.status(200).send(output);
 }catch(e){console.error('letter-export-failed');return res.status(500).send('Please try again');}
};