// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily check-in on Base. No payment to contract — only L2 gas.
/// @dev `lastCheckInDay` stores `currentDay + 1`, or `0` if the user has never checked in.
contract CheckIn {
    uint256 private constant SECONDS_PER_DAY = 86400;

    /// @notice Raw storage: 0 = never; else value is `dayIndex + 1` for the last check-in day.
    mapping(address => uint256) public lastCheckInDay;
    mapping(address => uint256) public streak;

    event CheckedIn(address indexed user, uint256 day, uint256 streakValue);

    error AlreadyCheckedIn();
    error ValueNotAllowed();

    function currentDay() public view returns (uint256) {
        return block.timestamp / SECONDS_PER_DAY;
    }

    /// @notice Last calendar day index the user checked in, or type(uint256).max if never.
    function lastCheckDay(address user) public view returns (uint256) {
        uint256 s = lastCheckInDay[user];
        if (s == 0) return type(uint256).max;
        return s - 1;
    }

    function checkIn() external payable {
        if (msg.value != 0) revert ValueNotAllowed();

        uint256 day = currentDay();
        uint256 s = lastCheckInDay[msg.sender];

        if (s != 0) {
            uint256 prev = s - 1;
            if (prev == day) revert AlreadyCheckedIn();
        }

        uint256 newStreak;
        if (s == 0) {
            newStreak = 1;
        } else {
            uint256 prev = s - 1;
            if (prev == day - 1) {
                newStreak = streak[msg.sender] + 1;
            } else {
                newStreak = 1;
            }
        }

        lastCheckInDay[msg.sender] = day + 1;
        streak[msg.sender] = newStreak;
        emit CheckedIn(msg.sender, day, newStreak);
    }
}
