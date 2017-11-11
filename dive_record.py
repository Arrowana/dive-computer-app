import random
import json

class DiveRecord:

	def __init__(self, dive_id, timestamp, depth):
		self.dive_id = dive_id
		self.timestamp = timestamp
		self.depth = depth #meters
		self.temperature = 0 #degrees celsius

	def __repr__(self):
		return 'DR: {dive_id}, {timestamp}, {depth}, {temperature}'.format(
			dive_id = self.dive_id,
			timestamp = self.timestamp,
			depth = self.depth,
			temperature = self.temperature
		)

	def to_json(self):
		json_content = '"dive_id": {dive_id}, "timestamp": {timestamp}, "depth": {depth}'.format(
			dive_id = self.dive_id,
			timestamp = self.timestamp,
			depth = self.depth
		)

		return '{' + json_content + '}'


class DiveRecordsGenerator:
	DT = 1

	def __init__(self):
		pass

	def generate_dive_records_for_one_dive(self, dive_id):
		max_depth = random.gauss(20, 10)

		if max_depth < 5: #Dive cannot be shallower than 5 meters
			max_depth = 5.0

		descending_rate = random.gauss(0.5, 0.5)
		if descending_rate <= 0:
			descending_rate = 0.1
		ascending_rate = random.gauss(0.5, 0.5)
		if ascending_rate <= 0:
			ascending_rate = 0.1

		print('Generating dive with max_depth: {}, desc_rate: {}, asc_rate: {}'.format(max_depth, descending_rate, ascending_rate))

		timestamp = 0
		dive_records = []

		depth = 0
		while(depth < max_depth):
			dive_records.append(DiveRecord(dive_id, timestamp, depth))
			depth += descending_rate + random.random()
			timestamp += 1

		while(depth > 0):
			dive_records.append(DiveRecord(dive_id, timestamp, depth))
			depth -= ascending_rate + random.random()
			timestamp+=1

		return dive_records

	def get_dive_records(self):
		number_of_dives = random.randint(1, 8)
		generated_dive_records = []

		for dive_id in range(number_of_dives):
			dive_records = self.generate_dive_records_for_one_dive(dive_id)
			generated_dive_records.extend(dive_records)

		return generated_dive_records

def test_generate_dive_records_for_one_dive():
	from matplotlib import pyplot as py
	generator = DiveRecordsGenerator()
	dive_records = generator.generate_dive_records_for_one_dive(0)
	print(dive_records)
	#json representation
	print(', '.join([dive_record.to_json() for dive_record in dive_records]))

	timestamps, depths = zip(*[(record.timestamp, record.depth) for record in dive_records])
	py.plot(timestamps, depths)
	py.show()

def test_dive_records_generator():
	generator = DiveRecordsGenerator()
	dive_records = generator.get_dive_records()
	print(dive_records)
