const fs = require('fs');
let data = fs.readFileSync('src/App.tsx', 'utf8');
data = data.replace(/bg-\[#DA291C\]/g, 'bg-black')
           .replace(/text-\[#DA291C\]/g, 'text-black')
           .replace(/border-\[#DA291C\]/g, 'border-black')
           .replace(/text-\[#FFC72C\]/g, 'text-gray-900')
           .replace(/bg-\[#FFC72C\]/g, 'bg-gray-100')
           .replace(/hover:bg-red-/g, 'hover:bg-gray-')
           .replace(/bg-red-/g, 'bg-gray-')
           .replace(/text-red-/g, 'text-gray-')
           .replace(/border-red-/g, 'border-gray-')
           .replace(/shadow-red-/g, 'shadow-gray-')
           .replace(/La Gastronomie Pizza/g, 'ZARIA')
           .replace(/La Gastronomie/g, 'ZARIA')
           .replace(/Gastro/g, 'ZARIA')
           .replace(/G\./g, 'Z.')
           .replace(/🍔/g, '👗')
           .replace(/🍟/g, '👜')
           .replace(/🍕/g, '👠')
           .replace(/🌭/g, '👖')
           .replace(/menu/g, 'collection');

fs.writeFileSync('src/App.tsx', data);

let admin = fs.readFileSync('src/Admin.tsx', 'utf8');
admin = admin.replace(/bg-\[#DA291C\]/g, 'bg-black')
           .replace(/text-\[#DA291C\]/g, 'text-black')
           .replace(/border-\[#DA291C\]/g, 'border-black')
           .replace(/text-\[#FFC72C\]/g, 'text-gray-900')
           .replace(/bg-\[#FFC72C\]/g, 'bg-gray-100')
           .replace(/hover:bg-red-/g, 'hover:bg-gray-')
           .replace(/bg-red-/g, 'bg-gray-')
           .replace(/text-red-/g, 'text-gray-')
           .replace(/border-red-/g, 'border-gray-')
           .replace(/shadow-red-/g, 'shadow-gray-')
           .replace(/La Gastronomie Pizza/g, 'ZARIA')
           .replace(/La Gastronomie/g, 'ZARIA')
           .replace(/Gastro/g, 'ZARIA')
           .replace(/G\./g, 'Z.');

fs.writeFileSync('src/Admin.tsx', admin);

let c = fs.readFileSync('src/admin/Layout.tsx', 'utf8');
c = c.replace(/bg-\[#DA291C\]/g, 'bg-black')
           .replace(/text-\[#DA291C\]/g, 'text-black')
           .replace(/border-\[#DA291C\]/g, 'border-black')
           .replace(/text-\[#FFC72C\]/g, 'text-gray-900')
           .replace(/bg-\[#FFC72C\]/g, 'bg-gray-100')
           .replace(/La Gastronomie Pizza/g, 'ZARIA')
           .replace(/La Gastronomie/g, 'ZARIA')
           .replace(/Gastro/g, 'ZARIA')
           .replace(/G\./g, 'Z.');
fs.writeFileSync('src/admin/Layout.tsx', c);

console.log('Colors replaced');
