commit:
	./commit.sh 

docstart:
	sudo service docker start

composeup:
	docker-compose up -d $(SERVICES)

composestop:
	docker-compose down

composedown:
	docker-compose down 

docstop:
	sudo service docker stop
