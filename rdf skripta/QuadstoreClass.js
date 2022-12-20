//https://comunica.dev/docs/query/getting_started/query_app/
//https://comunica.dev/docs/query/advanced/rdfjs_querying/
import { Quadstore } from 'quadstore';
import { ClassicLevel } from 'classic-level';
import { DataFactory} from 'rdf-data-factory';
import FileSystem from 'fs';
import { RdfXmlParser } from "rdfxml-streaming-parser";
import { Engine } from 'quadstore-comunica';

const db = new ClassicLevel('./db');
const df = new DataFactory();

const store = new Quadstore( {backend: db, dataFactory: df});
await store.open();

//var fileName = '../IEEE13 (copy).xml';
var fileName = '../IEEE13_Assets (copy).xml';


const myTextStream = FileSystem.createReadStream(fileName);

var quadStream = null;
const quadParser = new RdfXmlParser();

try {
  quadStream = quadParser.import(myTextStream);
} 
catch (exceptionVar) {   
  throw new Error(exceptionVar);
}

await store.putStream(quadStream);

// -- // --  // -- // --  // -- // --  // -- // --  // -- // --  // -- // --  // -- // --  // -- // --  // -- // --  

//query engine
const engine = new Engine(store);

//------------------UPIT------------------
const ClassNameQuery =        
  'PREFIX class: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>'+
  'select distinct ?ClassName where {'+        
    '?x class:type ?ClassName .'+    
  '}';
 
const ClassNameBindingsStream = await engine.queryBindings(ClassNameQuery);
const ClassNameBindings = await ClassNameBindingsStream.toArray();
ClassNameBindings.forEach(ClassNameIterator => {    

  const ClassName = ClassNameIterator.entries.hashmap.node.value.value;
  const CountClassInstancesQuery =          
  'select (count(*) as ?cnt) where {'+        
    '?x ?y <' + ClassName + '>'+   
  '}';  
  ExecuteCountClassInstances(CountClassInstancesQuery, getClassNameFromCIM(ClassName));    
});

async function ExecuteCountClassInstances(CountClassInstancesQuery, ClassName) {
  const CountClassInstancesBindingsStream = await engine.queryBindings(CountClassInstancesQuery);
  const CountClassInstancesBindings = await CountClassInstancesBindingsStream.toArray();
  CountClassInstancesBindings.forEach(CountClassInstancesIterator => {             

    console.log(ClassName + ', instances counted: ' + CountClassInstancesIterator.entries.hashmap.node.value.value)    
  });    
}

function getClassNameFromCIM(CIMClassName) {
  // example of CIMClassName string: http://iec.ch/TC57/CIM100#VoltageLimit
  // split it on # character and return right part
  return CIMClassName.split("#")[1];
}

//store.close();

