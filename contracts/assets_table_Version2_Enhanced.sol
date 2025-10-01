// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title HEAL Token - Healthcare Equity and Access Ledger
 * @dev Solidarity healthcare funding system based on global healthcare analysis
 * @author Scott Charles Olson - Solidarity Platform
 */
contract HEALToken is ERC20, Ownable, ReentrancyGuard, AccessControl {
    
    // Role definitions for healthcare ecosystem
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant NURSE_ROLE = keccak256("NURSE_ROLE");
    bytes32 public constant INTERN_ROLE = keccak256("INTERN_ROLE");
    bytes32 public constant LAB_TECH_ROLE = keccak256("LAB_TECH_ROLE");
    bytes32 public constant RESEARCHER_ROLE = keccak256("RESEARCHER_ROLE");
    bytes32 public constant BROKER_ROLE = keccak256("BROKER_ROLE");
    
    // Healthcare budget allocation structure
    struct HealthcareAllocation {
        uint256 totalBudget;           // Annual healthcare budget
        uint256 minYearDistribution;   // 50% distributed during year
        uint256 reserveFunds;          // 50% held in reserve
        uint256 equipmentFund;         // 35% for medical equipment
        uint256 generalFunds;          // 15% general operational funds
        uint256 visitCostFund;         // 25% for visit costs (equal pay for all)
        uint256 adminFund;             // 5% for administrators
        uint256 brokerFund;            // 5% for insurance brokers
        uint256 labFund;               // 10% for laboratory operations
        uint256 researchFund;          // 9% for medical research
        uint256 scottFund;             // 1% for Scott Olson
    }
    
    HealthcareAllocation public healthcareAllocation;
    
    // Healthcare professional tracking
    mapping(address => bool) public verifiedDoctors;
    mapping(address => bool) public verifiedNurses;
    mapping(address => bool) public verifiedInterns;
    mapping(address => bool) public verifiedLabTechs;
    mapping(address => bool) public verifiedResearchers;
    mapping(address => bool) public verifiedAdmins;
    mapping(address => bool) public verifiedBrokers;
    
    // Equal payment tracking for visit costs
    mapping(address => uint256) public visitPayments;
    mapping(address => uint256) public equipmentAllocations;
    mapping(address => string) public professionalSpecialty;
    
    // Budget cycle tracking
    uint256 public currentBudgetYear;
    uint256 public budgetStartTime;
    bool public budgetDistributionActive;
    
    // Healthcare waste and fraud prevention (based on global analysis)
    uint256 public constant MAX_WASTE_THRESHOLD = 20; // 20% max waste (OECD median)
    uint256 public constant FRAUD_DETECTION_THRESHOLD = 6; // 6% fraud detection level
    uint256 public totalWastePrevented;
    uint256 public totalFraudDetected;
    
    // Events for healthcare operations
    event BudgetAllocated(uint256 totalBudget, uint256 year, uint256 timestamp);
    event HealthcareProfessionalRegistered(address indexed professional, string role, string specialty);
    event VisitPaymentDistributed(address indexed recipient, uint256 amount, string visitType);
    event EquipmentFundingAllocated(address indexed facility, uint256 amount, string equipmentType);
    event ResearchGrantAwarded(address indexed researcher, uint256 amount, string projectTitle);
    event LabOperationsFunded(address indexed lab, uint256 amount, string operationType);
    event WastePreventionMeasure(uint256 amount, string wasteType);
    event FraudDetected(address indexed suspicious, uint256 amount, string fraudType);
    event ScottEarningsDistributed(uint256 amount, uint256 year);
    
    constructor(uint256 initialSupply) ERC20("Healthcare Equity Access Ledger", "HEAL") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        
        currentBudgetYear = 2025;
        budgetStartTime = block.timestamp;
        budgetDistributionActive = false;
        
        healthcareAllocation = HealthcareAllocation({
            totalBudget: 0,
            minYearDistribution: 0,
            reserveFunds: 0,
            equipmentFund: 0,
            generalFunds: 0,
            visitCostFund: 0,
            adminFund: 0,
            brokerFund: 0,
            labFund: 0,
            researchFund: 0,
            scottFund: 0
        });
    }
    
    /**
     * @dev Set annual healthcare budget with automatic allocation
     */
    function setAnnualBudget(uint256 totalBudget) external onlyOwner {
        require(totalBudget > 0, "Budget must be greater than zero");
        
        healthcareAllocation.totalBudget = totalBudget;
        
        // 50% minimum year distribution, 50% reserve
        healthcareAllocation.minYearDistribution = (totalBudget * 50) / 100;
        healthcareAllocation.reserveFunds = totalBudget - healthcareAllocation.minYearDistribution;
        
        // Allocation from total budget
        healthcareAllocation.equipmentFund = (totalBudget * 35) / 100;      // 35% equipment
        healthcareAllocation.generalFunds = (totalBudget * 15) / 100;       // 15% general funds
        healthcareAllocation.visitCostFund = (totalBudget * 25) / 100;      // 25% visit costs
        healthcareAllocation.adminFund = (totalBudget * 5) / 100;           // 5% admin
        healthcareAllocation.brokerFund = (totalBudget * 5) / 100;          // 5% brokers
        healthcareAllocation.labFund = (totalBudget * 10) / 100;            // 10% labs
        healthcareAllocation.researchFund = (totalBudget * 9) / 100;        // 9% research
        healthcareAllocation.scottFund = (totalBudget * 1) / 100;           // 1% Scott
        
        // Mint tokens for the minimum year distribution
        _mint(address(this), healthcareAllocation.minYearDistribution);
        
        budgetDistributionActive = true;
        currentBudgetYear++;
        budgetStartTime = block.timestamp;
        
        emit BudgetAllocated(totalBudget, currentBudgetYear, block.timestamp);
    }
    
    /**
     * @dev Register healthcare professionals
     */
    function registerDoctor(address doctor, string memory specialty) external onlyRole(ADMIN_ROLE) {
        require(!verifiedDoctors[doctor], "Doctor already registered");
        verifiedDoctors[doctor] = true;
        professionalSpecialty[doctor] = specialty;
        _setupRole(DOCTOR_ROLE, doctor);
        emit HealthcareProfessionalRegistered(doctor, "Doctor", specialty);
    }
    
    function registerNurse(address nurse, string memory specialty) external onlyRole(ADMIN_ROLE) {
        require(!verifiedNurses[nurse], "Nurse already registered");
        verifiedNurses[nurse] = true;
        professionalSpecialty[nurse] = specialty;
        _setupRole(NURSE_ROLE, nurse);
        emit HealthcareProfessionalRegistered(nurse, "Nurse", specialty);
    }
    
    function registerIntern(address intern, string memory program) external onlyRole(ADMIN_ROLE) {
        require(!verifiedInterns[intern], "Intern already registered");
        verifiedInterns[intern] = true;
        professionalSpecialty[intern] = program;
        _setupRole(INTERN_ROLE, intern);
        emit HealthcareProfessionalRegistered(intern, "Intern", program);
    }
    
    function registerLabTech(address labTech, string memory specialty) external onlyRole(ADMIN_ROLE) {
        require(!verifiedLabTechs[labTech], "Lab technician already registered");
        verifiedLabTechs[labTech] = true;
        professionalSpecialty[labTech] = specialty;
        _setupRole(LAB_TECH_ROLE, labTech);
        emit HealthcareProfessionalRegistered(labTech, "Lab Technician", specialty);
    }
    
    function registerResearcher(address researcher, string memory field) external onlyRole(ADMIN_ROLE) {
        require(!verifiedResearchers[researcher], "Researcher already registered");
        verifiedResearchers[researcher] = true;
        professionalSpecialty[researcher] = field;
        _setupRole(RESEARCHER_ROLE, researcher);
        emit HealthcareProfessionalRegistered(researcher, "Researcher", field);
    }
    
    function registerAdmin(address admin, string memory department) external onlyOwner {
        require(!verifiedAdmins[admin], "Admin already registered");
        verifiedAdmins[admin] = true;
        professionalSpecialty[admin] = department;
        _setupRole(ADMIN_ROLE, admin);
        emit HealthcareProfessionalRegistered(admin, "Administrator", department);
    }
    
    function registerBroker(address broker, string memory company) external onlyRole(ADMIN_ROLE) {
        require(!verifiedBrokers[broker], "Broker already registered");
        verifiedBrokers[broker] = true;
        professionalSpecialty[broker] = company;
        _setupRole(BROKER_ROLE, broker);
        emit HealthcareProfessionalRegistered(broker, "Insurance Broker", company);
    }
    
    /**
     * @dev Distribute equal visit cost payments (25% allocation)
     * All healthcare professionals get same amount for visits
     */
    function distributeVisitPayment(
        address[] memory recipients, 
        uint256 amountPerPerson,
        string memory visitType
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        uint256 totalPayment = amountPerPerson * recipients.length;
        require(healthcareAllocation.visitCostFund >= totalPayment, "Insufficient visit cost funds");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            require(
                verifiedDoctors[recipient] || 
                verifiedNurses[recipient] || 
                verifiedInterns[recipient],
                "Recipient must be verified healthcare professional"
            );
            
            visitPayments[recipient] += amountPerPerson;
            _transfer(address(this), recipient, amountPerPerson);
            
            emit VisitPaymentDistributed(recipient, amountPerPerson, visitType);
        }
        
        healthcareAllocation.visitCostFund -= totalPayment;
    }
    
    /**
     * @dev Allocate equipment funding (35% allocation)
     */
    function allocateEquipmentFunding(
        address facility, 
        uint256 amount, 
        string memory equipmentType
    ) external onlyRole(ADMIN_ROLE) {
        require(healthcareAllocation.equipmentFund >= amount, "Insufficient equipment funds");
        require(facility != address(0), "Invalid facility address");
        
        healthcareAllocation.equipmentFund -= amount;
        equipmentAllocations[facility] += amount;
        _transfer(address(this), facility, amount);
        
        emit EquipmentFundingAllocated(facility, amount, equipmentType);
    }
    
    /**
     * @dev Award research grants (9% allocation)
     */
    function awardResearchGrant(
        address researcher, 
        uint256 amount, 
        string memory projectTitle
    ) external onlyRole(ADMIN_ROLE) {
        require(verifiedResearchers[researcher], "Recipient must be verified researcher");
        require(healthcareAllocation.researchFund >= amount, "Insufficient research funds");
        
        healthcareAllocation.researchFund -= amount;
        _transfer(address(this), researcher, amount);
        
        emit ResearchGrantAwarded(researcher, amount, projectTitle);
    }
    
    /**
     * @dev Fund laboratory operations (10% allocation)
     */
    function fundLabOperations(
        address lab, 
        uint256 amount, 
        string memory operationType
    ) external onlyRole(ADMIN_ROLE) {
        require(healthcareAllocation.labFund >= amount, "Insufficient lab funds");
        require(lab != address(0), "Invalid lab address");
        
        healthcareAllocation.labFund -= amount;
        _transfer(address(this), lab, amount);
        
        emit LabOperationsFunded(lab, amount, operationType);
    }
    
    /**
     * @dev Distribute admin funding (5% allocation)
     */
    function distributeAdminFunding(address admin, uint256 amount) external onlyOwner {
        require(verifiedAdmins[admin], "Recipient must be verified admin");
        require(healthcareAllocation.adminFund >= amount, "Insufficient admin funds");
        
        healthcareAllocation.adminFund -= amount;
        _transfer(address(this), admin, amount);
    }
    
    /**
     * @dev Distribute broker funding (5% allocation)
     */
    function distributeBrokerFunding(address broker, uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(verifiedBrokers[broker], "Recipient must be verified broker");
        require(healthcareAllocation.brokerFund >= amount, "Insufficient broker funds");
        
        healthcareAllocation.brokerFund -= amount;
        _transfer(address(this), broker, amount);
    }
    
    /**
     * @dev Distribute Scott's earnings (1% allocation)
     */
    function distributeScottEarnings() external onlyOwner {
        require(healthcareAllocation.scottFund > 0, "No Scott funds available");
        
        uint256 amount = healthcareAllocation.scottFund;
        healthcareAllocation.scottFund = 0;
        _transfer(address(this), owner(), amount);
        
        emit ScottEarningsDistributed(amount, currentBudgetYear);
    }
    
    /**
     * @dev Fraud detection and prevention mechanism
     */
    function reportFraud(address suspicious, uint256 amount, string memory fraudType) external onlyRole(ADMIN_ROLE) {
        totalFraudDetected += amount;
        emit FraudDetected(suspicious, amount, fraudType);
        
        // Freeze suspicious account (additional security measure)
        // Could implement account freezing logic here
    }
    
    /**
     * @dev Waste prevention tracking
     */
    function reportWastePrevention(uint256 amount, string memory wasteType) external onlyRole(ADMIN_ROLE) {
        totalWastePrevented += amount;
        emit WastePreventionMeasure(amount, wasteType);
    }
    
    /**
     * @dev Get comprehensive budget breakdown
     */
    function getBudgetBreakdown() external view returns (
        uint256 totalBudget,
        uint256 minYearDistribution,
        uint256 reserveFunds,
        uint256 equipmentFund,
        uint256 generalFunds,
        uint256 visitCostFund,
        uint256 adminFund,
        uint256 brokerFund,
        uint256 labFund,
        uint256 researchFund,
        uint256 scottFund
    ) {
        return (
            healthcareAllocation.totalBudget,
            healthcareAllocation.minYearDistribution,
            healthcareAllocation.reserveFunds,
            healthcareAllocation.equipmentFund,
            healthcareAllocation.generalFunds,
            healthcareAllocation.visitCostFund,
            healthcareAllocation.adminFund,
            healthcareAllocation.brokerFund,
            healthcareAllocation.labFund,
            healthcareAllocation.researchFund,
            healthcareAllocation.scottFund
        );
    }
    
    /**
     * @dev Get healthcare professional summary
     */
    function getProfessionalSummary(address professional) external view returns (
        bool isDoctor,
        bool isNurse,
        bool isIntern,
        bool isLabTech,
        bool isResearcher,
        bool isAdmin,
        bool isBroker,
        string memory specialty,
        uint256 visitPaymentsReceived,
        uint256 equipmentAllocated
    ) {
        return (
            verifiedDoctors[professional],
            verifiedNurses[professional],
            verifiedInterns[professional],
            verifiedLabTechs[professional],
            verifiedResearchers[professional],
            verifiedAdmins[professional],
            verifiedBrokers[professional],
            professionalSpecialty[professional],
            visitPayments[professional],
            equipmentAllocations[professional]
        );
    }
    
    /**
     * @dev Get waste and fraud statistics
     */
    function getWasteAndFraudStats() external view returns (
        uint256 totalWastePrevented_,
        uint256 totalFraudDetected_,
        uint256 wasteThreshold,
        uint256 fraudThreshold
    ) {
        return (
            totalWastePrevented,
            totalFraudDetected,
            MAX_WASTE_THRESHOLD,
            FRAUD_DETECTION_THRESHOLD
        );
    }
}