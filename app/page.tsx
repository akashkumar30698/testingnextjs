'use client'

import React, { useState, useEffect, useMemo } from 'react';
import './App.css'

export default function Home() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>(''); // Source station
  const [destination, setDestination] = useState<string>(''); // Destination station
  const [shortestPath, setShortestPath] = useState<string[] | null>(null);
  const [currentStation, setCurrentStation] = useState<string>(''); // Current station
  const [svgHeight,setSvgHeight] = useState<number>(0)
  const [stationPositions, setStationPositions] = useState<{ [key: string]: { x: number; y: number } }>({
   //Violet Line
   'Raja Nahar Singh': { x: 300, y: 0},
   'Sant Surdas(Sihi)': { x: 300, y: 50 },
   'Ecorts Mujesar': { x: 300, y: 100 },
   'Bata Chowk': { x: 300, y: 150 },
   'Neelam Chowk Ajronda': { x: 300, y: 200},
   'Old Faridabad': { x: 300, y: 250 },
   'Badkal Mor': { x: 300, y: 300 },
   'Sector-28': { x: 300, y: 350 },
   'Mewala Maharajpur': { x: 300, y: 400 },
   'NHPC Chowk': { x: 300, y: 450 },
   'Sarai': { x: 300, y: 500 },
   'Badarpur Border': { x: 300, y: 550 },
   'Tughlakabad Station': { x: 300, y: 600 },
   'Mohan Estate': { x: 300, y: 650 },
   'Sarita Vihar': { x: 300, y: 700},
   'Jasola Apollo': { x: 300 ,y: 750},
   'Harkesh Nagar Okhla': { x:300,y: 800},
    'Govindpuri': {x:300,y:850},
    'Kalkaji Mandir': { x:300,y: 900},//Interchange to Magenta Line

    'Nehru Place': {x:300,y: 950},
    'Kailash Colony': { x:300,y: 1000},
    'Moolchand': { x: 300, y: 1050},
    'Lajpat Nagar': { x:300,y: 1100},//Interchange to Pink Line


    'Jangpura': { x:300, y: 1150},
    'JLN Stadium': { x:300, y: 1200},
    'Khan Market': { x:300,y: 1250},
    'Central Secretariat': { x: 300, y: 1300}, //Interchange to Yellow Line

    'Janpath': { x:300,y: 1350},
    'Mandi House': { x:300,y : 1400},//Interchange to Blue Line

    'ITO': { x: 300,y: 1450},
    'Delhi Gate': { x:300,y: 1500},
    'Jama Masjid': { x:300,y: 1550},
    'Lal Quila': { x:300, y:1600},
    'Kashmere Gate': { x: 300, y: 1650},//Interchange to Red Line

    //Magenta Line
    'Nehru Enclave': { x:300,y: 950},
    'Greater Kailash': { x:300,y: 1000},
    'Chirag Delhi': { x:300,y: 1050},
    'Panchsheel Park': { x:300,y: 1100},
    'Hauz Khas': { x:300, y: 1150}
  })


// Mapping of metro stations to their coordinates
const stationCoordinates: { [key: string]: { latitude: number; longitude: number } } = {
  'Badarpur Border': { latitude: 28.4408, longitude: 77.2965 },
  'Tughlakabad Station': { latitude: 28.5665, longitude: 77.2482 },
  'Mohan Estate': { latitude: 28.5263, longitude: 77.2657 },
  // Add more stations with their coordinates
};

// Function to determine current metro station
const getCurrentMetroStation = (latitude: number | null, longitude: number | null): string => {
  if (latitude === null || longitude === null) {
    return 'Location not available';
  }

  for (const station in stationCoordinates) {
    const { latitude: stationLat, longitude: stationLon } = stationCoordinates[station];
    // Calculate the distance between user location and station location (Haversine formula)
    const distance = Math.sqrt(
      Math.pow(latitude - stationLat, 2) + Math.pow(longitude - stationLon, 2)
    ) * 111320; // Approximate conversion from degrees to meters

    if (distance < 500) { // Within 500 meters
      return station; // Return the station name if within range
    }
  }
  return 'Not in a metro station'; // If no stations are found within the range
};

useEffect(() => {
  if (navigator.geolocation) {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        
        // Check current metro station
        const station = getCurrentMetroStation(position.coords.latitude, position.coords.longitude);
        setCurrentStation(station); // Update state with the current station
      },
      (err) => {
        setError('Error getting location: ' + err.message);
      }
    );

    // Clean up the watch position on component unmount
    return () => navigator.geolocation.clearWatch(watchId);
  } else {
    setError('Geolocation is not supported by this browser.');
  }
}, []);

  // Graph Type Definition
  type Graph = {
    [key: string]: string[]; // Adjacency list representation (each vertex points to an array of neighbors)
  };


  const updateStationPositions = (startStation: string,destinationStation: string) => {
    if (!stationPositions[startStation]) {
      return;
    }
  
    setStationPositions((prevPositions) => {
      const updatedPositions: { [key: string]: { x: number; y: number } } = {};
      let currentY = 20; // Start at y = 0
  
      // Sort the stations such that we start from the selected startStation and continue in order
      const sortedStations = Object.keys(prevPositions);
      const startIndex = sortedStations.indexOf(startStation);
      const reorderedStations = [
        ...sortedStations.slice(startIndex),
        ...sortedStations.slice(0, startIndex),
      ];
  
      // Update positions based on the reordered stations
      reorderedStations.forEach((station) => {
        updatedPositions[station] = {
          x: prevPositions[station].x,
          y: currentY,
        };
        currentY += 50; // Increase y-coordinate by 50 for each station
      });

      const svgY =  updatedPositions[destinationStation].y
      setSvgHeight(svgY + 20)
      console.log(svgY)

      console.log("updatedPositions:",updatedPositions,"stationPositions:",stationPositions)
  
      return updatedPositions;
    });
  };


  // Initialize the graph using useMemo to prevent recreation on each render
  const graph: Graph = useMemo(() => {
    const newGraph: Graph = {};

    // Helper to add a vertex
    const addVertex = (vertex: string) => {
      if (!newGraph[vertex]) {
        newGraph[vertex] = [];
      }
    };

    // Helper to add an edge
    const addEdge = (vertex1: string, vertex2: string) => {
      if (newGraph[vertex1] && newGraph[vertex2]) {
        newGraph[vertex1].push(vertex2);
        newGraph[vertex2].push(vertex1); // For undirected graphs
      }
    };

   //Violet line
   addVertex('Raja Nahar Singh');
   addVertex( 'Sant Surdas(Sihi)');
   addVertex( 'Ecorts Mujesar');
   addVertex( 'Bata Chowk');
   addVertex( 'Neelam Chowk Ajronda');
   addVertex( 'Old Faridabad');
   addVertex( 'Badkal Mor');
   addVertex( 'Sector-28');
   addVertex('Mewala Maharajpur')
   addVertex( 'NHPC Chowk');
   addVertex( 'Sarai');
   addVertex( 'Badarpur Border');
   addVertex( 'Tughlakabad Station');
   addVertex( 'Mohan Estate');
   addVertex( 'Sarita Vihar');
   addVertex( 'Jasola Apollo');
   addVertex('Harkesh Nagar Okhla')
   addVertex( 'Govindpuri');
   addVertex( 'Kalkaji Mandir'); // Interchange To Magenta Line
 
   addVertex( 'Nehru Place');
   addVertex( 'Kailash Colony');
   addVertex( 'Moolchand');
   addVertex('Lajpat Nagar')// Interchange to Pink Line
 
   addVertex( 'Jangpura');
   addVertex('JLN Stadium');
   addVertex( 'Khan Market');
   addVertex('Central Secretariat') //Interchange to Yellow Line
 
   addVertex( 'Janpath');
   addVertex( 'Mandi House');//Interchange to Blue Line
 
   addVertex( 'ITO');
   addVertex('Delhi Gate') 
   addVertex( 'Jama Masjid');
   addVertex('Lal Quila') 
   addVertex('Kashmere Gate') //Interchange to Red Line
 

    //Magenta Line
   addVertex('Nehru Enclave');
   addVertex( 'Greater Kailash');
   addVertex( 'Chirag Delhi');
   addVertex('Panchsheel Park')
   addVertex( 'Hauz Khas'); //Interchange to Yellow Line
 
   addVertex( 'IIT');
   addVertex( 'R K Puram');
   addVertex('Munrika') 
   addVertex( 'Vasant Vihar');
   addVertex( 'Shankar Vihar');
   addVertex( 'Terminal-I IGI Airport');
   addVertex('Sadar Bazar Cantonment') 
   addVertex( 'Palam');
   addVertex('Dashrathpuri') 
   addVertex('Dabri Mor-Janakpuri South') 
 
 
 
 

   //Relations With each other
   addEdge( 'Raja Nahar Singh', 'Sant Surdas(Sihi)');
   addEdge( 'Sant Surdas(Sihi)', 'Ecorts Mujesar');
   addEdge( 'Ecorts Mujesar', 'Bata Chowk');
   addEdge( 'Bata Chowk', 'Neelam Chowk Ajronda');
   addEdge( 'Neelam Chowk Ajronda', 'Old Faridabad');
   addEdge('Old Faridabad','Badkal Mor')
   addEdge( 'Badkal Mor', 'Sector-28');
   addEdge( 'Sector-28', 'Mewala Maharajpur');
   addEdge( 'Mewala Maharajpur', 'NHPC Chowk');
   addEdge('NHPC Chowk','Sarai')
   addEdge('Sarai','Badarpur Border')
   addEdge('Badarpur Border', 'Tughlakabad Station');
   addEdge( 'Tughlakabad Station', 'Mohan Estate');
   addEdge( 'Mohan Estate', 'Sarita Vihar');
   addEdge('Sarita Vihar', 'Jasola Apollo');
   addEdge('Jasola Apollo','Harkesh Nagar Okhla')
   addEdge('Harkesh Nagar Okhla', 'Govindpuri');
   addEdge('Govindpuri','Kalkaji Mandir') //Interchange to Magenta Line


   //Going Straight
   addEdge('Kalkaji Mandir','Nehru Place')
   addEdge( 'Nehru Place', 'Kailash Colony');
   addEdge( 'Kailash Colony', 'Moolchand');
   addEdge( 'Moolchand', 'Lajpat Nagar');//Interchange to Pink Line

   addEdge( 'Lajpat Nagar', 'Jangpura');
   addEdge( 'Jangpura', 'JLN Stadium');
   addEdge('JLN Stadium','Khan Market')
   addEdge( 'Khan Market', 'Central Secretariat');//Interchange to Yellow Line

   addEdge( 'Central Secretariat', 'Janpath');
   addEdge( 'Janpath', 'Mandi House'); //Interchange to Blue Line

   addEdge('Mandi House','ITO')
   addEdge('ITO','Delhi Gate')
   addEdge('Delhi Gate', 'Jama Masjid');
   addEdge( 'Jama Masjid', 'Lal Quila');
   addEdge( 'Lal Quila', 'Kashmere Gate');//Interchange to Red Line
   
   
   //Going (Left) to Magenta Line
   addEdge( 'Kalkaji Mandir', 'Nehru Enclave');
   addEdge( 'Nehru Enclave', 'Greater Kailash');
   addEdge( 'Greater Kailash', 'Chirag Delhi');
   addEdge( 'Chirag Delhi', 'Panchsheel Park');
   addEdge('Panchsheel Park','Hauz Khas') //Interchange to Yellow Line

   addEdge( 'Hauz Khas', 'IIT');
   addEdge( 'IIT', 'R K Puram');
   addEdge( 'R K Puram', 'Munrika');
   addEdge('Munrika','Vasant Vihar') 
   addEdge('Vasant Vihar','Shankar Vihar') 
   addEdge( 'Shankar Vihar', 'Terminal-I IGI Airport');
   addEdge( 'Terminal-I IGI Airport', 'Sadar Bazar Cantonment');
   addEdge( 'Sadar Bazar Cantonment', 'Palam');
   addEdge( 'Palam','Dashrathpuri') 
   addEdge( 'Dashrathpuri', 'Dabri Mor-Janakpuri South');
   addEdge( 'Dabri Mor-Janakpuri South', 'Janakpuri West');
   

   //Going (Right) to Magenta Line


    return newGraph;
  }, []); // Empty dependency array ensures it's created only once



  
  const findShortestPath = (graph: Graph, start: string, end: string): string[] | null => {
  
    if (!graph[start]) {
      console.error(`Start station "${start}" does not exist in the graph.`);
      return null;
    }
  
    if (!graph[end]) {
      console.error(`End station "${end}" does not exist in the graph.`);
      return null;
    }
  
    const queue: string[] = [start];
    const visited: { [key: string]: boolean } = {};
    const previous: { [key: string]: string | null } = {};
    visited[start] = true;
  
    while (queue.length > 0) {
      const vertex = queue.shift() as string;
  
  
      if (vertex === end) {
        const path: string[] = [];
        let current: string | null = end;
  
        // Start from the end and work back to the start
        while (current !== null) {
          path.push(current);
          current = previous[current] || null; // Move back to the previous station
        }

        console.log(`Found path: ${path.reverse().join(' -> ')}`);
        return path.reverse(); // Reverse to get the correct order
      }
  
      if (graph[vertex]) {
        graph[vertex].forEach((neighbor) => {
          if (!visited[neighbor]) {
            visited[neighbor] = true;
            previous[neighbor] = vertex; // Mark the previous node
            queue.push(neighbor);
          }
        });
      } else {
        console.error(`Station "${vertex}" has no neighbors in the graph.`);
      }
    }
  
    console.log("No path found.");
    return null; // Return null if no path is found
  };

  interface colorProps{
    Violet: string,
    Magenta: string
  }


  const colors: colorProps = {
    Violet: '#8F00FF',
    Magenta: '#FF00FF'
  }
  

   // Predefined set of colors for each station
  const stationColors: { [station: string]: string } = {
    'Raja Nahar Singh': colors.Violet,
    'Sant Surdas(Sihi)': colors.Violet,
    'Ecorts Mujesar': colors.Violet,
    'Bata Chowk': colors.Violet,
    'Neelam Chowk Ajronda': colors.Violet,
    'Old Faridabad': colors.Violet,
    'Badkal Mor': colors.Violet,
    'Sector-28': colors.Violet,
    'Mewala Maharajpur': colors.Violet,
    'NHPC Chowk': colors.Violet,
    'Sarai': colors.Violet,
    'Badarpur Border': colors.Violet,
    'Tughlakabad Station': colors.Violet,
    'Mohan Estate': colors.Violet,
    'Sarita Vihar': colors.Violet,
    'Jasola Apollo': colors.Violet,
    'Harkesh Nagar Okhla': colors.Violet,
    'Govindpuri': colors.Violet,
    'Kalkaji Mandir': colors.Magenta, //Interchange to Magenta Line(Left)

    //Going Straight
    'Nehru Place': colors.Violet,
    'Kailash Colony': colors.Violet,
    'Moolchand': colors.Violet,
    'Lajpat Nagar': colors.Violet, // Interchange to Pink Line

    'Jangpura': colors.Violet,
    'JLN Stadium': colors.Violet,
    'Khan Market': colors.Violet,
    'Central Secretariat': colors.Violet, // Interchange to Yellow Line

    'Janpath': colors.Violet,
    'Mandi House': colors.Violet, //Interchange to Blue Line

    'ITO': colors.Violet,
    'Delhi Gate': colors.Violet,
    'Jama Masjid': colors.Violet,
    'Lal Quila': colors.Violet,
    'Kashmere Gate': colors.Violet, // Interchange to Red Line

    'Nehru Enclave':colors.Magenta,
    'Greater Kailash':colors.Magenta,
    'Chirag Delhi': colors.Magenta,
    'Panchsheel Park': colors.Magenta,
    'Hauz Khas': colors.Magenta, //Interchange to Yellow Line

  };

  // Function to get a color for each station
  const getStationColor = (station: string): string => {
    return stationColors[station] || '#7f00ff'; // Default to purple if no color defined
  };

// Render edges for the shortest path
const renderEdges = () => {
  const edges: JSX.Element[] = [];
  
  if (shortestPath) {
    for (let i = 0; i < shortestPath.length - 1; i++) {
      const vertex = shortestPath[i];
      const neighbor = shortestPath[i + 1];

      if (stationPositions[vertex] && stationPositions[neighbor]) {
        const isVertexInterchange = getStationColor(vertex);
        const isNeighborInterchange = getStationColor(neighbor);
        const strokeColor = isVertexInterchange
          ? stationColors[vertex]
          : isNeighborInterchange
          ? stationColors[neighbor]
          : '#7f00ff'; // Default color
          

        edges.push(
          <line
            key={`${vertex}-${neighbor}`}
            x1={stationPositions[vertex].x}
            y1={stationPositions[vertex].y}
            x2={stationPositions[neighbor].x}
            y2={stationPositions[neighbor].y}
            stroke={strokeColor}
            strokeWidth="5"
          />
        );
      }
    }
  }

  return edges;
};

const renderVertices = () => {
  if (!shortestPath || shortestPath.length === 0) return null;

  // Get the start and end vertices from the shortestPath
  const startVertex = shortestPath[0];
  const endVertex = shortestPath[shortestPath.length - 1];

  console.log(shortestPath,startVertex)
  return shortestPath.map((station) => (
    <g key={station}>
      <ellipse
        cx={stationPositions[station].x}
        cy={stationPositions[station].y}
        rx="12"
        ry="10"
        fill={getStationColor(station) ? stationColors[station] : '#7f00ff'}
        stroke={getStationColor(station) ? stationColors[station] : '#7f00ff'}
        strokeWidth="5"
      />
      <text
        x={stationPositions[station].x + 20}
        y={stationPositions[station].y + 5}
        fontSize="12"
        fill="#000"
      >
        {station}
      </text>
    </g>
  ));
};


const handleFindPath = () => {
  const path = findShortestPath(graph, source, destination);
  if (path) {
    setShortestPath(path);
    updateStationPositions(source,destination); // Call this after finding the path
  } else {
    setShortestPath(null);
  }
};


  return (
    <>
      <div>
        <h1>Metro Navigation</h1>
        {latitude && longitude ? (
          <p>
            Your current location: Latitude: {latitude}, Longitude: {longitude}
          </p>
        ) : (
          <p>{error ? error : 'Fetching your location...'}</p>
        )}
      </div>

      {/* Display Current Station */}
      <div>
        <h2>Current Station</h2>
        <p>{currentStation || 'Fetching current station...'}</p>
      </div>

      {/* Inputs for source and destination */}
      <div>
        <label>Source: </label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <label>Destination: </label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <button onClick={handleFindPath}>Find</button>
      </div>

          {/* SVG rendering */}
          <div className='svg'>
          <svg
          width='100%'
          height={svgHeight}
          >
          {renderEdges()}
          {renderVertices()}
          </svg>
          </div>
   
        

      

      {shortestPath && (
        <div>
          <h2>Shortest Path</h2>
          <p>{shortestPath.join(' -> ')}</p>
        </div>
      )}
    </>
  );
}
