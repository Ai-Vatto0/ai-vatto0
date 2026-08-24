import { tools, callTool } from '../src/native-mcp.js';

const SERVER = { name:'lyra-kie-v2', version:'2.1.1' };
function send(res,status,body){res.status(status);res.setHeader('Content-Type','application/json');res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','content-type,mcp-session-id');res.setHeader('Access-Control-Expose-Headers','Mcp-Session-Id');return res.end(JSON.stringify(body));}
export default async function handler(req,res){
  if(req.method==='OPTIONS'){res.status(204);res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','content-type,mcp-session-id');return res.end();}
  if(req.method!=='POST') return send(res,405,{error:'Method not allowed'});
  const body=req.body??{}; const {jsonrpc='2.0',id,method,params={}}=body;
  try{
    if(method==='initialize') return send(res,200,{jsonrpc,id,result:{protocolVersion:params.protocolVersion??'2025-06-18',capabilities:{tools:{}},serverInfo:SERVER,instructions:'Lyra V2 preserves legacy Lyra KIE models and adds Kling 3.0 plus product/job storage. Before paid generation use prepare_kie_render and require explicit approval. Never retry createTask automatically.'}});
    if(method==='notifications/initialized') return res.status(204).end();
    if(method==='ping') return send(res,200,{jsonrpc,id,result:{}});
    if(method==='tools/list') return send(res,200,{jsonrpc,id,result:{tools}});
    if(method==='tools/call'){const result=await callTool(params.name,params.arguments??{});return send(res,200,{jsonrpc,id,result});}
    return send(res,200,{jsonrpc,id,error:{code:-32601,message:`Method not found: ${method}`}});
  }catch(e){return send(res,200,{jsonrpc,id,error:{code:-32603,message:e instanceof Error?e.message:String(e)}});}
}
