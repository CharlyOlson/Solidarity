// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title LUNCH$ Token - Learning Universal Nutrition Community Hub
 * @dev Educational funding system with layered cross-hold gradient tracking
 * @author Scott Charles Olson - Solidarity Platform
 */
contract LunchToken is ERC20, Ownable, ReentrancyGuard, AccessControl {
    
    // Role definitions for educational ecosystem
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TEACHER_ROLE = keccak256("TEACHER_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");
    bytes32 public constant STAFF_ROLE = keccak256("STAFF_ROLE");
    bytes32 public constant FACILITY_MANAGER_ROLE = keccak256("FACILITY_MANAGER_ROLE");
    bytes32 public constant PROGRAM_COORDINATOR_ROLE = keccak256("PROGRAM_COORDINATOR_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant CHURCH_PARTNER_ROLE = keccak256("CHURCH_PARTNER_ROLE");
    
    // Layered Cross-Hold Gradient Structure for Education
    struct GradientLayer {
        uint256 inputAmount;           // Funds coming into this layer
        uint256 outputAmount;          // Funds going out of this layer
        uint256 heldAmount;            // Funds held in reserve at this layer
        uint256 lossAmount;            // Documented losses (waste, fraud)
        uint256 gainAmount;            // Efficiency gains or recovered funds
        uint256 overlapAmount;         // Overlapping funds with other layers
        uint256 netPositionChange;     // Net change in position
        bool isPositive;               // Whether layer shows net gain or loss
        uint256 lastUpdated;           // Timestamp of last update
    }
    
    // Cross-Hold Analysis Structure
    struct CrossHoldAnalysis {
        mapping(string => GradientLayer) layers;                    // Budget allocation layers
        mapping(string => mapping(string => uint256)) crossOverlaps; // Cross-layer overlaps
        string[] activeLayerNames;                                   // Active layer tracking
        uint256 totalSystemInput;                                   // Total system input
        uint256 totalSystemOutput;                                  // Total system output
        uint256 totalSystemHeld;                                    // Total held in system
        uint256 totalSystemLoss;                                    // Total documented losses
        uint256 totalSystemGain;                                    // Total documented gains
        uint256 netSystemPosition;                                  // Net system position
        bool systemIsPositive;                                      // System net positive/negative
    }
    
    CrossHoldAnalysis public gradientAnalysis;
    
    // Educational budget allocation structure (reframed from SAIL)
    struct EducationalAllocation {
        uint256 totalBudget;           // Annual educational budget
        uint256 minYearDistribution;   // 50% distributed during year
        uint256 reserveFunds;          // 50% held in reserve
        uint256 staffFund;             // 25% for all school staff (equal pay)
        uint256 facilitiesFund;        // 25% for facilities and maintenance
        uint256 booksFund;             // 15% for books and educational materials
        uint256 teacherStudentPrograms; // 30% for teacher/student programs, trips, music, art, athletics, special ed
        uint256 adminFund;             // 4% for administrators
        uint256 scottSpiritualFund;    // 1% for Scott's spiritual and community education support
    }
    
    EducationalAllocation public educationalAllocation;
    
    // True Figure Tracking with Gradient Overlap
    struct TrueFigureTracking {
        mapping(address => uint256) realInputs;          // Actual inputs per address
        mapping(address => uint256) realOutputs;         // Actual outputs per address
        mapping(address => uint256) reportedInputs;      // Reported inputs per address
        mapping(address => uint256) reportedOutputs;     // Reported outputs per address
        mapping(address => int256) varianceTracking;     // Difference between real and reported
        mapping(string => uint256) sectorOverlaps;       // Overlapping sector funds
        uint256 totalVariance;                           // Total system variance
        uint256 accuracyPercentage;                      // System accuracy percentage
    }
    
    TrueFigureTracking public trueFigures;
    
    // Educational ecosystem tracking
    mapping(address => bool) public verifiedTeachers;
    mapping(address => bool) public verifiedStudents;
    mapping(address => bool) public verifiedStaff;
    mapping(address => bool) public verifiedFacilityManagers;
    mapping(address => bool) public verifiedProgramCoordinators;
    mapping(address => bool) public verifiedAdmins;
    mapping(address => bool) public verifiedChurches;
    mapping(address => bool) public verifiedAuditors;
    
    // Enhanced tracking for educational activities
    mapping(address => uint256) public staffPayments;              // Staff salary payments
    mapping(address => uint256) public facilityAllocations;        // Facility funding
    mapping(address => uint256) public bookAllocations;            // Book and material funding
    mapping(address => uint256) public programFunding;             // Program and trip funding
    mapping(address => string) public educatorSpecialty;           // Teacher/staff specialty
    mapping(address => string) public programType;                 // Type of educational program
    mapping(address => string) public churchDenomination;
    mapping(address => uint256) public spiritualEducationFunding;
    
    // Budget cycle tracking
    uint256 public currentBudgetYear;
    uint256 public budgetStartTime;
    bool public budgetDistributionActive;
    
    // Educational waste and fraud prevention
    uint256 public constant MAX_WASTE_THRESHOLD = 15; // 15% max waste for education
    uint256 public constant FRAUD_DETECTION_THRESHOLD = 5; // 5% fraud detection level
    uint256 public totalWastePrevented;
    uint256 public totalFraudDetected;
    
    // Gradient analysis constants
    uint256 public constant OVERLAP_TOLERANCE = 3; // 3% tolerance for overlaps
    uint256 public constant ACCURACY_TARGET = 97;  // 97% accuracy target for education
    
    // Events for enhanced educational tracking
    event BudgetAllocated(uint256 totalBudget, uint256 year, uint256 timestamp);
    event GradientLayerUpdated(string layerName, uint256 input, uint256 output, uint256 held, int256 netChange);
    event CrossOverlapDetected(string layer1, string layer2, uint256 overlapAmount, uint256 timestamp);
    event TrueFigureVariance(address entity, int256 variance, uint256 reportedAmount, uint256 actualAmount);
    event SystemAccuracyCalculated(uint256 accuracyPercentage, uint256 totalVariance, uint256 timestamp);
    
    // Educational specific events
    event EducatorRegistered(address indexed educator, string role, string specialty);
    event StudentRegistered(address indexed student, string grade, string school);
    event StaffPaymentDistributed(address indexed staff, uint256 amount, string paymentType);
    event FacilityFundingAllocated(address indexed facility, uint256 amount, string facilityType);
    event BookFundingAllocated(address indexed recipient, uint256 amount, string bookType);
    event ProgramFunded(address indexed coordinator, uint256 amount, string programType);
    event SchoolTripFunded(address indexed school, uint256 amount, string destination);
    event ArtsMusicFunded(address indexed program, uint256 amount, string artType);
    event AthleticsFunded(address indexed team, uint256 amount, string sport);
    event SpecialEducationFunded(address indexed program, uint256 amount, string specialNeed);
    event WastePreventionMeasure(uint256 amount, string wasteType);
    event FraudDetected(address indexed suspicious, uint256 amount, string fraudType);
    event SpiritualEducationFunded(address indexed church, uint256 amount, string program);
    event ScottSpiritualFundsDistributed(uint256 amount, uint256 year, string purpose);
    
    constructor(uint256 initialSupply) ERC20("Learning Universal Nutrition Community Hub", "LUNCH$") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(AUDITOR_ROLE, msg.sender);
        
        currentBudgetYear = 2025;
        budgetStartTime = block.timestamp;
        budgetDistributionActive = false;
        
        // Initialize educational allocation
        educationalAllocation = EducationalAllocation({
            totalBudget: 0,
            minYearDistribution: 0,
            reserveFunds: 0,
            staffFund: 0,
            facilitiesFund: 0,
            booksFund: 0,
            teacherStudentPrograms: 0,
            adminFund: 0,
            scottSpiritualFund: 0
        });
        
        // Initialize gradient analysis layers
        _initializeGradientLayers();
    }
    
    /**
     * @dev Initialize gradient analysis layers for educational tracking
     */
    function _initializeGradientLayers() internal {
        string[11] memory layerNames = [
            "Staff", "Facilities", "Books", "Programs", "Music", "Arts", 
            "Athletics", "SpecialEducation", "Trips", "Admin", "SpiritualEducation"
        ];
        
        for (uint i = 0; i < layerNames.length; i++) {
            gradientAnalysis.activeLayerNames.push(layerNames[i]);
            gradientAnalysis.layers[layerNames[i]] = GradientLayer({
                inputAmount: 0,
                outputAmount: 0,
                heldAmount: 0,
                lossAmount: 0,
                gainAmount: 0,
                overlapAmount: 0,
                netPositionChange: 0,
                isPositive: true,
                lastUpdated: block.timestamp
            });
        }
    }
    
    /**
     * @dev Set annual educational budget with automatic allocation
     */
    function setAnnualBudget(uint256 totalBudget) external onlyOwner {
        require(totalBudget > 0, "Budget must be greater than zero");
        
        educationalAllocation.totalBudget = totalBudget;
        
        // 50% minimum year distribution, 50% reserve
        educationalAllocation.minYearDistribution = (totalBudget * 50) / 100;
        educationalAllocation.reserveFunds = totalBudget - educationalAllocation.minYearDistribution;
        
        // Educational allocation breakdown
        educationalAllocation.staffFund = (totalBudget * 25) / 100;              // 25% staff (equal pay)
        educationalAllocation.facilitiesFund = (totalBudget * 25) / 100;         // 25% facilities
        educationalAllocation.booksFund = (totalBudget * 15) / 100;              // 15% books/materials
        educationalAllocation.teacherStudentPrograms = (totalBudget * 30) / 100; // 30% programs/trips/arts/athletics/special ed
        educationalAllocation.adminFund = (totalBudget * 4) / 100;               // 4% admin
        educationalAllocation.scottSpiritualFund = (totalBudget * 1) / 100;      // 1% spiritual education
        
        // Initialize gradient layers with budget allocations
        _initializeBudgetGradientLayers(totalBudget);
        
        // Mint tokens for the minimum year distribution
        _mint(address(this), educationalAllocation.minYearDistribution);
        
        budgetDistributionActive = true;
        currentBudgetYear++;
        budgetStartTime = block.timestamp;
        
        emit BudgetAllocated(totalBudget, currentBudgetYear, block.timestamp);
    }
    
    /**
     * @dev Initialize gradient layers with educational allocations
     */
    function _initializeBudgetGradientLayers(uint256 totalBudget) internal {
        // Staff layer (25% - teachers, janitors, cafeteria, security, etc.)
        gradientAnalysis.layers["Staff"].inputAmount = (totalBudget * 25) / 100;
        gradientAnalysis.layers["Staff"].heldAmount = (totalBudget * 25) / 100;
        
        // Facilities layer (25% - buildings, maintenance, utilities)
        gradientAnalysis.layers["Facilities"].inputAmount = (totalBudget * 25) / 100;
        gradientAnalysis.layers["Facilities"].heldAmount = (totalBudget * 25) / 100;
        
        // Books layer (15% - textbooks, digital materials, supplies)
        gradientAnalysis.layers["Books"].inputAmount = (totalBudget * 15) / 100;
        gradientAnalysis.layers["Books"].heldAmount = (totalBudget * 15) / 100;
        
        // Programs layer (7.5% from 30% total)
        gradientAnalysis.layers["Programs"].inputAmount = (totalBudget * 75) / 1000; // 7.5%
        gradientAnalysis.layers["Programs"].heldAmount = (totalBudget * 75) / 1000;
        
        // Music layer (7.5% from 30% total)
        gradientAnalysis.layers["Music"].inputAmount = (totalBudget * 75) / 1000; // 7.5%
        gradientAnalysis.layers["Music"].heldAmount = (totalBudget * 75) / 1000;
        
        // Sports layer (7.5% from 30% total)
        gradientAnalysis.layers["Sports"].inputAmount = (totalBudget * 75) / 1000;
        gradientAnalysis.layers["Sports"].heldAmount = (totalBudget * 75) / 1000;
        
        // Arts layer (7.5% from 30% total)  
        gradientAnalysis.layers["Arts"].inputAmount = (totalBudget * 75) / 1000;
        gradientAnalysis.layers["Arts"].heldAmount = (totalBudget * 75) / 1000;
        
        // Science layer (5% from remaining)
        gradientAnalysis.layers["Science"].inputAmount = (totalBudget * 5) / 100;
        gradientAnalysis.layers["Science"].heldAmount = (totalBudget * 5) / 100;
    }
}
