// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CheckIn} from "../src/CheckIn.sol";

contract CheckInTest is Test {
    CheckIn internal c;
    address internal alice = address(0xA11ce);

    function setUp() public {
        c = new CheckIn();
    }

    function test_RevertWhenSendingEth() public {
        vm.expectRevert(CheckIn.ValueNotAllowed.selector);
        c.checkIn{value: 1 wei}();
    }

    function test_FirstCheckInSetsStreakOne() public {
        vm.startPrank(alice);
        uint256 day = block.timestamp / 86400;
        c.checkIn();
        vm.stopPrank();
        assertEq(c.streak(alice), 1);
        assertEq(c.lastCheckDay(alice), day);
    }

    function test_RevertSecondCheckInSameDay() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.expectRevert(CheckIn.AlreadyCheckedIn.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_StreakIncrementsNextDay() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.warp(block.timestamp + 86400);
        c.checkIn();
        vm.stopPrank();
        assertEq(c.streak(alice), 2);
    }

    function test_StreakResetsAfterGap() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.warp(block.timestamp + 3 * 86400);
        c.checkIn();
        vm.stopPrank();
        assertEq(c.streak(alice), 1);
    }

    function test_DayZeroFirstCheckIn() public {
        vm.warp(100);
        vm.startPrank(alice);
        c.checkIn();
        vm.stopPrank();
        assertEq(c.lastCheckDay(alice), 0);
        vm.expectRevert(CheckIn.AlreadyCheckedIn.selector);
        vm.prank(alice);
        c.checkIn();
    }
}
