import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialProblems = [
  {
    slug: 'parking-lot',
    title: 'Parking Lot System',
    difficulty: 'Medium',
    description: 'Design an object-oriented parking lot system supporting multiple floors, vehicle types, parking spot allocations, dynamic pricing strategies, ticket generation, and vehicle exits.',
    requirements: JSON.stringify([
      'Support multiple floors in the parking facility.',
      'Support different vehicle types (e.g., Motorcycle, Car, Bus/Truck).',
      'Support different parking spot types matching vehicle sizes.',
      'Assign an appropriate available parking spot to an incoming vehicle.',
      'Generate a parking ticket upon vehicle entry with timestamp and spot details.',
      'Calculate parking fees based on duration and vehicle/pricing strategy on exit.',
      'Allow a vehicle to exit and release its assigned parking spot.',
      'The design should be extensible for future requirements (e.g., EV charging spots, VIP reservations).',
    ]),
    constraints: JSON.stringify([
      'Capacity limits must be checked before ticket issue.',
      'Pricing calculation logic should be decoupled from parking floor management.',
    ]),
    rubric: JSON.stringify({
      criteria: [
        { name: 'Requirement Understanding', description: 'Covers entry, exit, spot allocation, ticket, and fee calculation.', weight: 1.0 },
        { name: 'Responsibility Allocation', description: 'Clear separation between ParkingLot, ParkingFloor, Spot, and Pricing.', weight: 1.0 },
        { name: 'Abstraction and Interfaces', description: 'Interface abstractions used for pricing strategy and spot management.', weight: 1.0 },
        { name: 'Coupling and Cohesion', description: 'Low coupling between fee calculation and space allocation.', weight: 1.0 },
        { name: 'Extensibility', description: 'Easily accommodates new vehicle types, spot types, or pricing rules.', weight: 1.0 },
        { name: 'Explanation and Trade-offs', description: 'Justifies why specific abstractions were selected.', weight: 1.0 },
      ],
    }),
  },
  {
    slug: 'vending-machine',
    title: 'Vending Machine',
    difficulty: 'Easy',
    description: 'Design a state-driven vending machine system supporting item selection, payment processing (coins/cash), change calculation, inventory tracking, and refund/cancel handling.',
    requirements: JSON.stringify([
      'Support multiple inventory racks with different items, prices, and quantities.',
      'Support state transitions (e.g., Idle, HasMoney, ItemSelected, Dispensing).',
      'Accept money (coins/notes) and track current balance.',
      'Allow user to select an item by rack/code.',
      'Dispense item and calculate change if balance is sufficient.',
      'Allow user to cancel transaction and return inserted money at any point before dispensing.',
      'Handle out-of-stock scenarios gracefully.',
    ]),
    constraints: JSON.stringify([
      'State pattern or state machine transitions should be explicit.',
      'Inventory management must prevent dispensing out-of-stock items.',
    ]),
    rubric: JSON.stringify({
      criteria: [
        { name: 'Requirement Understanding', description: 'Covers selection, payment, states, and change return.', weight: 1.0 },
        { name: 'Responsibility Allocation', description: 'State management separated from inventory and payment.', weight: 1.0 },
        { name: 'Abstraction and Interfaces', description: 'State interface used for machine states.', weight: 1.0 },
        { name: 'Coupling and Cohesion', description: 'Inventory logic decoupled from UI/hardware abstraction.', weight: 1.0 },
        { name: 'Extensibility', description: 'Easy to add new states or payment methods (card, UPI).', weight: 1.0 },
        { name: 'Explanation and Trade-offs', description: 'Explains state machine vs conditional logic trade-offs.', weight: 1.0 },
      ],
    }),
  },
  {
    slug: 'elevator-system',
    title: 'Elevator Control System',
    difficulty: 'Hard',
    description: 'Design a multi-elevator controller system handling internal floor requests, external hall calls (Up/Down), dispatching strategy algorithms (LOOK/SSTF), and elevator state transitions.',
    requirements: JSON.stringify([
      'Support multiple elevator cars in a building with multiple floors.',
      'Handle hall calls (external requests from floors specifying Up or Down).',
      'Handle car calls (internal requests from inside an elevator car specifying target floor).',
      'Dispatch appropriate elevator car based on direction, distance, and current load.',
      'Track state of each elevator (Idle, Moving Up, Moving Down, Maintenance, Doors Open/Closed).',
      'Optimize movement strategy to minimize user wait time and energy consumption.',
      'Support emergency stop and door obstruction safety signals.',
    ]),
    constraints: JSON.stringify([
      'Dispatching algorithm strategy should be pluggable.',
      'Elevator state transitions must be thread-safe in concept.',
    ]),
    rubric: JSON.stringify({
      criteria: [
        { name: 'Requirement Understanding', description: 'Covers internal calls, hall calls, state tracking, and dispatching.', weight: 1.0 },
        { name: 'Responsibility Allocation', description: 'ElevatorController separated from ElevatorCar and DispatchStrategy.', weight: 1.0 },
        { name: 'Abstraction and Interfaces', description: 'Pluggable DispatchStrategy interface.', weight: 1.0 },
        { name: 'Coupling and Cohesion', description: 'Car movement logic decoupled from request scheduling.', weight: 1.0 },
        { name: 'Extensibility', description: 'Ability to swap dispatch algorithms (e.g. FCFS, LOOK, SCAN).', weight: 1.0 },
        { name: 'Explanation and Trade-offs', description: 'Justifies dispatch algorithm and state machine decisions.', weight: 1.0 },
      ],
    }),
  },
];

async function main() {
  console.log('Seeding initial LLD problems...');
  for (const prob of initialProblems) {
    await prisma.problem.upsert({
      where: { slug: prob.slug },
      update: {
        title: prob.title,
        difficulty: prob.difficulty,
        description: prob.description,
        requirements: prob.requirements,
        constraints: prob.constraints,
        rubric: prob.rubric,
      },
      create: prob,
    });
  }
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
