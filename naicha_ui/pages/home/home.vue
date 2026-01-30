<template>
	<view class="container">
		<!-- 顶部目标区域 -->
		<view class="target-section">
			<view class="target-card" @tap="switchTarget">
				<view class="target-info">
					<text class="label">当前目标</text>
					<text class="target-name">{{ currentTarget.name }}</text>
					<text class="target-desc">{{ currentTarget.duration }} | {{ currentTarget.frequency }}</text>
				</view>
				<view class="switch-btn">
					<text>切换 ></text>
				</view>
			</view>
		</view>

		<!-- 核心打卡区域 -->
		<view class="clock-in-section">
			<view class="clock-in-circle" :class="{ 'done': hasClockedIn }" @tap="handleClockIn">
				<view class="inner-circle">
					<text class="status-text">{{ hasClockedIn ? '已打卡' : '今日打卡' }}</text>
					<text class="time-text" v-if="hasClockedIn">{{ clockInTime }}</text>
					<text class="hint-text" v-else>坚持就是胜利</text>
				</view>
			</view>
			
			<view class="streak-info">
				<text>已连续打卡 <text class="highlight">{{ streakDays }}</text> 天</text>
			</view>
			
			<!-- 微记录状态 -->
			<view class="record-status" v-if="hasClockedIn" @tap="editRecord">
				<text>{{ hasRecord ? '✨ 已记录今日心情' : '✍️ 添加微记录' }}</text>
			</view>
		</view>

		<!-- 底部功能入口 -->
		<view class="grid-menu">
			<view class="menu-item" @tap="navTo('record')">
				<view class="icon-box blue">📅</view>
				<text>打卡记录</text>
			</view>
			<view class="menu-item" @tap="navTo('moment')">
				<view class="icon-box orange">⏳</view>
				<text>时光馆</text>
			</view>
			<view class="menu-item" @tap="navTo('achievement')">
				<view class="icon-box yellow">🏅</view>
				<text>勋章墙</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentTarget: {
					name: '喝8杯水',
					duration: '5分钟',
					frequency: '每日打卡'
				},
				hasClockedIn: false,
				clockInTime: '',
				streakDays: 3,
				hasRecord: false
			}
		},
		methods: {
			switchTarget() {
				uni.showToast({ title: '目标切换功能开发中', icon: 'none' });
			},
			handleClockIn() {
				if (this.hasClockedIn) return;
				
				this.hasClockedIn = true;
				const now = new Date();
				this.clockInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
				this.streakDays++;
				
				uni.showToast({
					title: '打卡成功！你真棒～',
					icon: 'success'
				});
				
				// 模拟收到匿名小赞
				setTimeout(() => {
					uni.showModal({
						title: '收到匿名小赞',
						content: '不慌不忙，慢慢成长，你超优秀！',
						showCancel: false,
						confirmText: '开心收下'
					});
				}, 1500);
			},
			editRecord() {
				uni.showToast({ title: '微记录功能开发中', icon: 'none' });
			},
			navTo(page) {
				uni.showToast({ title: page + ' 功能开发中', icon: 'none' });
			}
		}
	}
</script>

<style lang="scss">
	.container {
		min-height: 100vh;
		background-color: #F8F8F8;
		padding: 30rpx;
	}
	
	.target-section {
		margin-bottom: 60rpx;
		
		.target-card {
			background-color: #fff;
			padding: 30rpx 40rpx;
			border-radius: 24rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
			
			.target-info {
				display: flex;
				flex-direction: column;
				
				.label {
					font-size: 24rpx;
					color: #999;
					margin-bottom: 10rpx;
				}
				
				.target-name {
					font-size: 36rpx;
					font-weight: bold;
					color: #333;
					margin-bottom: 6rpx;
				}
				
				.target-desc {
					font-size: 24rpx;
					color: #666;
				}
			}
			
			.switch-btn {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
	
	.clock-in-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 80rpx;
		
		.clock-in-circle {
			width: 320rpx;
			height: 320rpx;
			border-radius: 50%;
			background: linear-gradient(135deg, #6B8AFF, #8CA6FF);
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 10rpx 30rpx rgba(107, 138, 255, 0.3);
			margin-bottom: 40rpx;
			transition: all 0.3s;
			
			&.done {
				background: #E0E0E0;
				box-shadow: none;
				
				.inner-circle {
					.status-text { color: #999; }
					.time-text { color: #999; }
				}
			}
			
			.inner-circle {
				width: 280rpx;
				height: 280rpx;
				border-radius: 50%;
				border: 4rpx solid rgba(255,255,255,0.3);
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				
				.status-text {
					font-size: 40rpx;
					font-weight: bold;
					color: #fff;
					margin-bottom: 10rpx;
				}
				
				.hint-text, .time-text {
					font-size: 24rpx;
					color: rgba(255,255,255,0.9);
				}
				
				.time-text {
					font-family: monospace;
					font-size: 32rpx;
				}
			}
			
			&:active {
				transform: scale(0.95);
			}
		}
		
		.streak-info {
			font-size: 28rpx;
			color: #666;
			margin-bottom: 20rpx;
			
			.highlight {
				color: #6B8AFF;
				font-weight: bold;
				font-size: 36rpx;
				margin: 0 6rpx;
			}
		}
		
		.record-status {
			font-size: 26rpx;
			color: #6B8AFF;
			padding: 10rpx 30rpx;
			background-color: rgba(107, 138, 255, 0.1);
			border-radius: 30rpx;
		}
	}
	
	.grid-menu {
		display: flex;
		justify-content: space-between;
		padding: 0 20rpx;
		
		.menu-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 30%;
			
			.icon-box {
				width: 100rpx;
				height: 100rpx;
				border-radius: 24rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 44rpx;
				margin-bottom: 16rpx;
				
				&.blue { background-color: #E8F0FF; }
				&.orange { background-color: #FFF4E6; }
				&.yellow { background-color: #FFF9C4; }
			}
			
			text {
				font-size: 26rpx;
				color: #333;
			}
		}
	}
</style>
