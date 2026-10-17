const complaints = [
  {
    name: "Rajesh Patil",
    phone: "9876543210",
    category: "Street Light",
    location: "Ward No. 3, Main Road",
    description: "The street light is not working.",
    status: "Pending"
  },
  {
    name: "Sneha Shinde",
    phone: "9876543211",
    category: "Road",
    location: "Ward No. 5, Shivaji Chowk",
    description: "The road has many potholes.",
    status: "In Progress"
  },
  {
    name: "Amit Jadhav",
    phone: "9876543212",
    category: "Water Supply",
    location: "Ward No. 2, Gandhi Nagar",
    description: "There has been no water supply for two days.",
    status: "Pending"
  },
  {
    name: "Pooja More",
    phone: "9876543213",
    category: "Garbage",
    location: "Ward No. 4, Market Area",
    description: "Garbage has not been collected for three days.",
    status: "Resolved"
  },
  {
    name: "Sagar Pawar",
    phone: "9876543214",
    category: "Drainage",
    location: "Ward No. 1, Near Bus Stand",
    description: "The drainage is blocked and water is overflowing.",
    status: "In Progress"
  }
];

console.log(complaints);

module.exports = {data: complaints }