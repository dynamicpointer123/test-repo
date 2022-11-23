import { Quadstore } from 'quadstore';
import { ClassicLevel } from 'classic-level';
import { DataFactory} from 'rdf-data-factory';
import fs from 'fs';
import { RdfXmlParser } from "rdfxml-streaming-parser";
import { Engine } from 'quadstore-comunica';

const db = new ClassicLevel('./db');
const df = new DataFactory();

const store = new Quadstore( {backend: db, dataFactory: df});
await store.open();

// -- // --  // -- // --  // -- // --  // -- // --  // -- // --  // -- // --  // -- // --  // -- // --  // -- // --  

var fileName = '../olympics.rdf';
const myTextStream = fs.createReadStream(fileName);

var quadStream = null;
const quadParser = new RdfXmlParser();

try {
  quadStream = quadParser.import(myTextStream)
} 
catch (exceptionVar) {   
  throw new Error(exceptionVar);
}

await store.putStream(quadStream);

// Retrieves all quads using Quadstore's API  
const { items } = await store.get({});
console.log(items);

// -- // --  // -- // --  // -- // --  // -- // --  // -- // --  // -- // --  // -- // --  // -- // --  // -- // --  

//query engine
const engine = new Engine(store);

var query = 'SELECT * {?s ?p ?o}';

const bindingsStream = await engine.queryBindings(query);

bindingsStream.on('data', (bindings) => {   
  bindings.forEach(element => {
    console.log(element);  
  });
});

store.close();