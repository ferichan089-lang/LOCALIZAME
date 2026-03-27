// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Localizame
 * @notice Registro inmutable de alertas de personas desaparecidas en MONAD
 * @dev Cada alerta queda grabada on-chain con coordenadas y timestamp
 */
contract Localizame {

    struct Alert {
        uint256 id;
        address reporter;
        string  missingName;
        string  description;
        int256  lat;      // multiplied by 1e6 (e.g. 19432600 = 19.4326)
        int256  lng;      // multiplied by 1e6
        uint256 createdAt;
        bool    resolved;
    }

    uint256 public alertCount;
    mapping(uint256 => Alert) public alerts;
    mapping(address => uint256[]) public alertsByReporter;

    /* ── Events ── */
    event AlertCreated(
        uint256 indexed alertId,
        address indexed reporter,
        string  missingName,
        int256  lat,
        int256  lng,
        uint256 timestamp
    );
    event AlertResolved(uint256 indexed alertId, address indexed resolver);

    /* ── Create Alert ── */
    function createAlert(
        string calldata missingName,
        string calldata description,
        int256          lat,
        int256          lng
    ) external returns (uint256 alertId) {
        alertId = ++alertCount;

        alerts[alertId] = Alert({
            id:          alertId,
            reporter:    msg.sender,
            missingName: missingName,
            description: description,
            lat:         lat,
            lng:         lng,
            createdAt:   block.timestamp,
            resolved:    false
        });

        alertsByReporter[msg.sender].push(alertId);

        emit AlertCreated(alertId, msg.sender, missingName, lat, lng, block.timestamp);
    }

    /* ── Resolve Alert ── */
    function resolveAlert(uint256 alertId) external {
        Alert storage a = alerts[alertId];
        require(a.id != 0,          "Alert not found");
        require(!a.resolved,        "Already resolved");
        require(a.reporter == msg.sender, "Not the reporter");

        a.resolved = true;
        emit AlertResolved(alertId, msg.sender);
    }

    /* ── Views ── */
    function getAlert(uint256 alertId) external view returns (Alert memory) {
        return alerts[alertId];
    }

    function getAlertsByReporter(address reporter) external view returns (uint256[] memory) {
        return alertsByReporter[reporter];
    }
}
